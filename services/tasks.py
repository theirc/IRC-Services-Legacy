import hashlib
import json
import logging
import random
from datetime import datetime, timedelta

import requests
import six
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.mail import get_connection, send_mail
from django.db.models import Q
from haystack.management.commands import update_index
from celery.task import task

from services.utils import get_service_data_from_clinic
from . import jira_support


logger = logging.getLogger(__name__)


@task
def email_provider_about_service_approval_task(service_pk):
    from .models import Service
    service = Service.objects.get(pk=service_pk)
    site = Site.objects.get_current()
    site.name = 'Service Provider Portal'
    scheme = 'https' if settings.SECURE_LINKS else 'http'
    if settings.DEBUG:
        # E.g. http://localhost:8000/#/service/168
        service_link = '%s://%s/spp/#/service/%d' % (scheme, site, service_pk)
    else:
        # E.g. https://serviceinfo-staging.rescue.org/app/#/service/22
        service_link = '%s://%s/spp/#/service/%d' % (scheme, site, service_pk)
    context = {
        'site': site,
        'service': service,
        'provider': service.provider,
        'user': service.provider.user,
        'service_link': service_link,
    }
    service.provider.user.send_email_to_user(
        context,
        'email/service_approved_subject.txt',
        'email/service_approved_body.txt',
        'email/service_approved_body.html',
    )


@task
def email_provider_about_service_rejection_task(service_pk):
    from .models import Service
    service = Service.objects.get(pk=service_pk)
    site = Site.objects.get_current()
    site.name = 'Service Provider Portal'
    scheme = 'https' if settings.SECURE_LINKS else 'http'
    if settings.DEBUG:
        # E.g. http://localhost:8000/#/service/168
        service_link = '%s://%s/spp/#/service/%d' % (scheme, site, service_pk)
    else:
        # E.g. https://serviceinfo-staging.rescue.org/app/#/service/22
        service_link = '%s://%s/spp/#/service/%d' % (scheme, site, service_pk)
    context = {
        'site': site,
        'service': service,
        'provider': service.provider,
        'user': service.provider.user,
        'service_link': service_link,
    }
    service.provider.user.send_email_to_user(
        context,
        'email/service_rejection_subject.txt',
        'email/service_rejection_subject.txt',
        'email/service_rejection_subject.html',
    )


@task
def process_jira_work():
    from .models import JiraUpdateRecord
    if not all((settings.JIRA_USER, settings.JIRA_PASSWORD, settings.JIRA_SERVER)):
        logger.error('JIRA configuration values are not all set, cannot do JIRA work.')
        return

    work_qs = JiraUpdateRecord.objects.order_by('id').filter(jira_issue_key='')
    todo_count = len(work_qs)
    done_count = 0

    if todo_count:
        jira = jira_support.get_jira()
        for jira_record in work_qs:
            jira_record.do_jira_work(jira)
            if jira_record.jira_issue_key:
                done_count += 1

    logger.info('process_jira_work successfully handled %s of %s pending work requests.' % (
        done_count, todo_count))


@task
def fetch_services_from_clinic_finder():
    from services.models import Service, Provider, ServiceType, ProviderType
    try:
        r = requests.get('http://www.clinicfinder.org/clinics.json')
        r.raise_for_status()
    except requests.exceptions.RequestException as ex:
        logger.error(ex)
        return
    count = 0
    clinics = json.loads(r.text)
    external_provider_type = ProviderType.objects.get(name_en='External source')
    provider, _ = Provider.objects.get_or_create(name_en='Clinic Finder', type=external_provider_type)
    service_type = ServiceType.objects.get(name_en='Health Services')
    for clinic in (x for x in clinics if x['verified']):
        try:
            data = get_service_data_from_clinic(clinic)
            data['status'] = Service.STATUS_CURRENT

            Service.objects.update_or_create(
                foreign_object_id=clinic['id'],
                type=service_type,
                provider=provider,
                defaults=data
            )
            count += 1
        except Exception as ex:
            logger.info(ex)
            continue
    logger.info('Successfully fetched {} clinics from Clinic Finder.'.format(count))


def create_confirmation_key(service_name):
    salt = hashlib.sha1(six.text_type(random.random()).encode('ascii')).hexdigest()[:5]
    salt = salt.encode('ascii')
    if isinstance(service_name, six.text_type):
        service_name = service_name.encode('utf-8')
    return hashlib.sha1(salt + service_name).hexdigest()


def send_newsletter_emails(newsletter_data, email_type='confirmation'):
    from .models import NewsletterEmailTemplate, ServiceConfirmationLog as Log
    from django.template.loader import render_to_string
    import time

    types = {
        'confirmation': Log.PENDING,
        'reminder': Log.PENDING_REMINDER
    }
    subjects = {
        'confirmation': 'Refugee.Info {} Service Map, {} Update - {}',
        'reminder': 'Reminder! Refugee.Info {} Service Map, {} Update - {}'
    }
    confirmation_url = settings.API_URL + '#/service/confirm/'
    for first_focal_point, first_focal_point_dict in newsletter_data.items():
        for second_focal_point, services in first_focal_point_dict.items():
            if services:
                message, subject, location, provider, focal_points_names = '', '', '', '', ''
                days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
                for service in services:
                    service.confirmation_key = create_confirmation_key(service.name)
                    newsletter_valid_emails = first_focal_point
                    if second_focal_point is not 'solo':
                        newsletter_valid_emails = ', '.join((first_focal_point, second_focal_point))
                    service.newsletter_valid_emails = newsletter_valid_emails
                    service.exclude_from_confirmation = False
                    service.save()
                    message += 'Hello! please confirm your "{service}" service\n{confirm}\n\n'.format(
                        service=service.name,
                        confirm=confirmation_url.format(
                            service_id=service.id,
                            confirmation_key=service.confirmation_key
                        )
                    )
                    service.opening_time = json.loads(service.opening_time)
                    if service.opening_time.get('24/7'):
                        service.opening_time = {
                            'open_all_time': True
                        }
                    else:
                        opening_time = {}
                        for day in days:
                            opening_time[day] = service.opening_time.get(day)
                            for shift in opening_time[day]:
                                shift['open'] = datetime.strptime(shift.get('open'), "%H:%M:%S") \
                                    if shift.get('open') else None
                                shift['close'] = datetime.strptime(shift.get('close'), "%H:%M:%S") \
                                    if shift.get('close') else None
                        service.opening_time = opening_time

                    location = service.region.name
                    provider = service.provider.name

                    receiver_name = ''
                    if service.focal_point_email and service.focal_point_first_name:
                        receiver_name = service.focal_point_first_name
                    elif service.second_focal_point_email and service.second_focal_point_first_name:
                        receiver_name = service.second_focal_point_first_name

                    subject = subjects.get(email_type)\
                        .format(location, datetime.now().strftime("%B"), provider)
                try:
                    if second_focal_point is 'solo':
                        logger.info('Sending {} email to single focal point {} for services: "{}"'
                                    .format(email_type, first_focal_point, services))
                    else:
                        logger.info('Sending {} email to both focal points: {}, {} for services: "{}"'
                                    .format(email_type, first_focal_point, second_focal_point, services))

                    newsletter_settings = NewsletterEmailTemplate.objects\
                        .filter(type__in=[NewsletterEmailTemplate.SERVICE_BASE,
                                          NewsletterEmailTemplate.SERVICE_CONFIRMATION,
                                          NewsletterEmailTemplate.SERVICE_REMINDER])
                    newsletter_settings = {x.name: x.value for x in list(newsletter_settings)}
                    content_html = render_to_string('service_newsletter/' + email_type + '.html',
                                                    context={'services': services,
                                                             'receiver_name': receiver_name,
                                                             'location': location,
                                                             'provider': provider,
                                                             'confirmation_url': confirmation_url,
                                                             'web_client_url': settings.WEB_CLIENT_URL,
                                                             'days': days,
                                                             'newsletter_settings': newsletter_settings
                                                             })

                    recipient_list = [first_focal_point]
                    if second_focal_point is not 'solo':
                        recipient_list.append(second_focal_point)
                    with get_connection(
                        host=settings.NEWSLETTER_FROM_EMAIL_HOST,
                        port=settings.NEWSLETTER_FROM_EMAIL_PORT,
                        username=settings.NEWSLETTER_FROM_EMAIL_HOST_USER,
                        password=settings.NEWSLETTER_FROM_EMAIL_HOST_PASSWORD,
                        user_tls=settings.NEWSLETTER_FROM_EMAIL_USE_TLS
                    ) as connection:
                        sent = send_mail(
                            subject=subject,
                            message=message,
                            from_email=settings.NEWSLETTER_FROM_EMAIL,
                            recipient_list=recipient_list,
                            html_message=content_html,
                            connection=connection)
                        if sent == 1:
                            for service in services:
                                Log.objects.create(
                                    service=service,
                                    status=types.get(email_type),
                                    note='Automated ' + email_type + ' email sent.',
                                    sent_to=service.newsletter_valid_emails
                                )
                        else:
                            for service in services:
                                Log.objects.create(
                                    service=service,
                                    status=Log.ERROR,
                                    note='Automated ' + email_type + ' email failed.',
                                    sent_to=service.newsletter_valid_emails
                                )

                except Exception as e:
                    logger.error(e)
                    for service in services:
                        Log.objects.create(
                            service=service,
                            status=Log.ERROR,
                            note=e,
                            sent_to=service.newsletter_valid_emails
                        )


@task
def service_confirmation_newsletter():
    from .models import Service
    from .models import ServiceConfirmationLog as Log
    if settings.NEWSLETTER_ENABLED:
        # Newsletter cycle periods based on settings
        confirmation_time_period = timedelta(minutes=int(settings.CONFIRM_TIME)) if settings.NEWSLETTER_TEST else \
            timedelta(days=int(settings.CONFIRM_TIME))
        reminder_time_period = timedelta(minutes=int(settings.REMINDER_TIME)) if settings.NEWSLETTER_TEST else \
            timedelta(days=int(settings.REMINDER_TIME))
        reminder_unconfirmed_time_period = timedelta(
            minutes=int(settings.REMINDER_UNCONFIRMED_REPORT_TIME)) if settings.NEWSLETTER_TEST else \
            timedelta(days=int(settings.REMINDER_UNCONFIRMED_REPORT_TIME))
        confirm, remind, report = False, False, False

        # Filter for services with Focal Points Email, status Current and by Excluding from next Newsletter
        services = Service.objects.prefetch_related('confirmation_logs').select_related('region')\
            .filter((Q(focal_point_email__isnull=False) & ~Q(focal_point_email='')) |
                    (Q(second_focal_point_email__isnull=False) & ~Q(second_focal_point_email='')),
                    exclude_from_confirmation=False, status=Service.STATUS_CURRENT)
        services_exempted = Service.objects.prefetch_related('confirmation_logs').select_related('region')\
            .filter((Q(focal_point_email__isnull=False) & ~Q(focal_point_email='')) |
                    (Q(second_focal_point_email__isnull=False) & ~Q(second_focal_point_email='')),
                    exclude_from_confirmation=True, status=Service.STATUS_CURRENT)

        services_to_confirm = {}
        services_to_remind = {}
        services_to_report = []

        # Gathering all services that has to be confirmed (or reminded) - in normal newsletter cycle
        for service in services:
            conf_log = service.confirmation_logs.filter(status=Log.PENDING).order_by('-date').first()
            focal_added_log = service.confirmation_logs.filter(status=Log.FOCAL_POINT_ADDED).order_by('-date').first()
            if not conf_log or time_is_up(conf_log.date, confirmation_time_period):
                if (not focal_added_log and time_is_up(service.created_at, confirmation_time_period))\
                        or (focal_added_log and time_is_up(focal_added_log.date, confirmation_time_period)):
                    logger.info('Confirmation required for service: {}'.format(service.name))
                    update_sorted_services(services_to_confirm, service)
                    confirm = True
                    continue
            conf_log = service.confirmation_logs.all().order_by('-date').first()
            if conf_log and conf_log.status == Log.PENDING and time_is_up(conf_log.date, reminder_time_period):
                logger.info('Reminder required for service: {}'.format(service.name))
                update_sorted_services(services_to_remind, service)
                remind = True
            if conf_log and conf_log.status == Log.PENDING_REMINDER \
                    and time_is_up(conf_log.date, reminder_unconfirmed_time_period):
                services_to_report.append(service)
                report = True

        # Gathering all services that has to be confirmed - after being excluded from previous newsletter cycle
        for service in services_exempted:
            conf_log = service.confirmation_logs.filter(status=Log.PENDING).order_by('-date').first()
            focal_added_log = service.confirmation_logs.filter(status=Log.FOCAL_POINT_ADDED).order_by('-date').first()
            if not conf_log or time_is_up(conf_log.date, 2*confirmation_time_period):
                if not focal_added_log or time_is_up(focal_added_log.date, 2*confirmation_time_period):
                    logger.info('Confirmation required for service: {}'.format(service.name))
                    update_sorted_services(services_to_confirm, service)
                    confirm = True
                    continue

        # Sending Newsletter
        if confirm:
            send_newsletter_emails(services_to_confirm)
        if remind:
            send_newsletter_emails(services_to_remind, 'reminder')
        if report:
            services_unconfirmed_send_report(services_to_report)


def services_unconfirmed_send_report(services):
    from django.template.loader import render_to_string
    from .models import ServiceConfirmationLog as Log

    # Send report for services
    for service in services:
        provider_name = service.provider.name if service.provider.name else ''
        city = ", " + service.address_city if service.address_city else ''
        subject = 'Refugee.Info - Unconfirmed: ' + provider_name + city
        content_html = render_to_string('service_newsletter/unconfirmed.html', context={
            'service': service,
            'api_url': settings.API_URL,
            'time_unit': 'minutes' if settings.NEWSLETTER_TEST else 'days',
            'time_number': settings.REMINDER_UNCONFIRMED_REPORT_TIME
        })

        sent = send_mail(
            subject=subject,
            message='Report',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.SERVICE_MANAGER_EMAIL],
            html_message=content_html)

        if sent == 1:
            Log.objects.create(
                service=service,
                status=Log.PENDING_UNCONFIRMED_REMINDER,
                note='Report about unconfirmed reminder sent.',
                sent_to=settings.SERVICE_MANAGER_EMAIL
            )
        else:
            Log.objects.create(
                service=service,
                status=Log.ERROR,
                note='Report about unconfirmed reminder failed.',
                sent_to=settings.SERVICE_MANAGER_EMAIL
            )


def time_is_up(starting_time, time_period):
    return starting_time.replace(tzinfo=None, second=0, microsecond=0) + time_period <= datetime.now()


def update_sorted_services(focal_points_dict, service):
    """
    Builds a dict with services
    First key is alphabetically first focal point email
    Second is another focal point email or 'solo' if service has only one email
    Example
    {
      'asmith@test.com':
      {
        'solo': [<Service: Weqwe>],
        'jwalker@test.com': [<Service: aaa>]
      },
      'jwalker@test.com': {'solo': [<Service: >]}
    }
    """
    mails = []
    if service.focal_point_email:
        mails.append(service.focal_point_email)
    second_focal_mail = service.second_focal_point_email
    if second_focal_mail and second_focal_mail != service.focal_point_email:
        mails.append(second_focal_mail)
    mails = sorted(mails, key=str.lower)

    if mails:
        first_mail = mails[0]
        if first_mail not in focal_points_dict:
            focal_points_dict[first_mail] = {}

        if len(mails) == 1:
            if 'solo' not in focal_points_dict[first_mail]:
                focal_points_dict[first_mail]['solo'] = []
            focal_points_dict[first_mail]['solo'].append(service)
        if len(mails) == 2:
            second_mail = mails[1]
            if second_mail not in focal_points_dict[first_mail]:
                focal_points_dict[first_mail][second_mail] = []
            focal_points_dict[first_mail][second_mail].append(service)

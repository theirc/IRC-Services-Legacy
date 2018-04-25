from datetime import datetime

from django.core.mail import get_connection, send_mail

from api.utils import generate_translated_fields
from ckeditor.fields import RichTextField
from collections import defaultdict
from django.conf import settings
from django.contrib.gis.db import models
from django.contrib.gis.geos import Point
from django.contrib.sites.models import Site
from django.core.exceptions import ValidationError
from django.urls import reverse
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.transaction import atomic
from django.template.loader import render_to_string
from django.utils.translation import ugettext_lazy as _
from regions import models as region_models
from sorl.thumbnail import ImageField
from sorl.thumbnail.shortcuts import get_thumbnail
from . import jira_support
from .meta import TranslatableModel
from .tasks import email_provider_about_service_approval_task, email_provider_about_service_rejection_task
from .utils import absolute_url, get_path_to_service


class ProviderType(TranslatableModel, models.Model):
    __translatable__ = {
        'name': lambda l: models.CharField(
            # Translators: Provider name
            _("Name in {LANGUAGE_NAME}".format(**l)),
            max_length=256,  # Length is a guess
            default='',
            blank=True,
        ),
    }

    number = models.IntegerField(null=True)

    def get_api_url(self):
        """Return the PATH part of the URL to access this object using the API"""
        return reverse('providertype-detail', args=[self.id])


def at_least_one_letter(s):
    return any([c.isalpha() for c in s])


def blank_or_at_least_one_letter(s):
    return s == '' or at_least_one_letter(s)

class ServiceType(TranslatableModel, models.Model):
    __translatable__ = {
        "name": lambda l: models.CharField(
            _("name in {LANGUAGE_NAME}".format(**l)),
            max_length=256,
            default='',
            blank=True,
        ),
        "comments": lambda l: models.CharField(
            _("comments in {LANGUAGE_NAME}".format(**l)),
            max_length=512,
            default='',
            blank=True,
        )
    }

    number = models.IntegerField(blank=True, null=True)

    icon = models.ImageField(
        upload_to='service-type-icons',
        verbose_name=_("icon"),
        blank=True,
    )
    icon_url = models.URLField(null=True, blank=True)
    vector_icon = models.CharField(max_length=100, null=True, blank=True, verbose_name=_("Vector Icon"))
    color = models.CharField(max_length=7, blank=True)

    class Meta(object):
        ordering = ['number', ]

    def get_api_url(self):
        return reverse('servicetype-detail', args=[self.id])

    def get_icon_url(self):
        """Return URL PATH of the icon image for this record"""
        # For convenience of serializers
        if self.icon:
            return self.icon.url
        return self.icon_url

    def get_icon_base64(self):
        """Return URL PATH of the icon image for this record"""
        from requests import get
        import mimetypes
        import base64
        try:
            url = self.get_icon_url()
            image = get(url).content
            mime, a = mimetypes.guess_type(url)
            b64data = base64.b64encode(image)

            return "data:{};base64,{}".format(mime, b64data.decode("ascii"))
        except:
            return ""

class Provider(TranslatableModel, models.Model):
    __translatable__ = {
        'name': lambda l: models.CharField(
            # Translators: Provider name
            _("Name in {LANGUAGE_NAME}".format(**l)),
            max_length=256,  # Length is a guess
            default='',
            blank=True,
            validators=[blank_or_at_least_one_letter]
        ),
        'description': lambda l: models.TextField(
            # Translators: Provider description
            _("description in {LANGUAGE_NAME}".format(**l)),
            default='',
            blank=True,
        ),
        'focal_point_name': lambda l: models.CharField(
            _("focal point name in {LANGUAGE_NAME}".format(**l)),
            max_length=256,  # Length is a guess
            default='',
            blank=True,
            validators=[blank_or_at_least_one_letter]
        ),
        'address': lambda l: models.TextField(
            _("provider address in {LANGUAGE_NAME}".format(**l)),
            default='',
            blank=True,
        ),
    }

    type = models.ForeignKey(
        ProviderType,
        verbose_name=_("type"),
    )
    phone_number = models.CharField(
        _("phone number"),
        max_length=20,
        blank=True,
        null=True,
        validators=[
        ]
    )
    website = models.CharField(
        _("website"),
        max_length=255,
        blank=True,
        default=''
    )
    team = models.ManyToManyField(
        to=settings.AUTH_USER_MODEL,
        verbose_name=_('Team'),
        related_name='providers',
        blank=True,
    )
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        verbose_name=_('Admin'),
        related_name='managed_providers',
        null=True,
        blank=True,
    )
    number_of_monthly_beneficiaries = models.IntegerField(
        _("number of targeted beneficiaries monthly"),
        blank=True, null=True,
        validators=[
            MinValueValidator(0),
            MaxValueValidator(1000000)
        ]
    )
    
    focal_point_phone_number = models.CharField(
        _("focal point phone number"),
        max_length=20,
        blank=True,
        null=True,
        validators=[
        ]
    )

    region = models.ForeignKey(to=region_models.GeographicRegion,
    verbose_name=_('Region'),
    related_name='providers',
    null=True,
    blank=True
    )

    is_frozen = models.BooleanField(
        _("is frozen"),
        blank=False,
        null=False,
        default=False,
    )

    facebook = models.CharField(
        _("facebook"),
        max_length=255,
        blank=True,
        default=''
    )

    twitter = models.CharField(
        _("twitter"),
        max_length=255,
        blank=True,
        default=''
    )

    service_types = models.ManyToManyField(
        ServiceType,
        verbose_name=_("service_types"),
        blank=True
    )

    meta_population = models.IntegerField(
        _("meta_population"),
        blank=True, null=True,
        validators=[
            MinValueValidator(0)
        ]
    )

    record = models.TextField(
        _("record"),
        blank=True,
        default='',
    )

    requirement = models.TextField(
        _("requirement"),
        blank=True,
        default='',
    )

    vacancy = models.BooleanField(
        _("vacancy"),
        blank=True,
        default=False,
    )

    additional_info = models.TextField(
        _("additional_info"),
        blank=True,
        default='',
    )

    @property
    def service_set(self):
        return self.services

    def get_api_url(self):
        """Return the PATH part of the URL to access this object using the API"""
        return reverse('provider-detail', args=[self.id])

    def get_fetch_url(self):
        """Return the PATH part of the URL to fetch this object using the API"""
        return reverse('provider-detail', args=[self.id])

    def notify_jira_of_change(self):
        JiraUpdateRecord.objects.create(
            update_type=JiraUpdateRecord.PROVIDER_CHANGE,
            provider=self
        )

    def get_admin_edit_url(self):
        """Return the PATH part of the URL to edit this object in the admin"""
        return reverse('admin:services_provider_change', args=[self.id])


class ServiceAreaManager(models.GeoManager):
    def top_level(self):
        """
        Return the top-level areas, i.e. the ones with no parents
        """
        return super().get_queryset().filter(parent=None)


class ServiceArea(TranslatableModel, models.Model):
    __translatable__ = {
        'name': lambda l: models.CharField(
            verbose_name=_("Name in {LANGUAGE_NAME}".format(**l)),
            max_length=256,
            default='',
            blank=True,
        )
    }

    parent = models.ForeignKey(
        to='self',
        verbose_name=_('parent area'),
        help_text=_('the area that contains this area'),
        null=True,
        blank=True,
        related_name='children',
    )
    geographic_region = models.ForeignKey(
        region_models.GeographicRegion,
        null=True,
        default=None,
        on_delete=models.SET_NULL,
    )

    objects = ServiceAreaManager()

    @property
    def centroid(self):
        return self.geographic_region.centroid

    def get_api_url(self):
        return reverse('servicearea-detail', args=[self.id])


class SelectionCriterion(TranslatableModel, models.Model):
    """
    A selection criterion limits who can receive the service.
    It's just a text string. E.g. "age under 18".
    """
    __translatable__ = {
        "text": lambda l: models.CharField(max_length=100, blank=True, default='')
    }
    service = models.ForeignKey('services.Service', related_name='selection_criteria')

    class Meta(object):
        verbose_name_plural = _("selection criteria")

    def clean(self):
        if not any(getattr(self, field) for field in generate_translated_fields('text', False)):
            raise ValidationError(_("Selection criterion must have text in at least "
                                    "one language"))

    def __str__(self):
        return ', '.join([text for text in [getattr(self, field) for field
                                            in generate_translated_fields('text', False)] if text])

    def get_api_url(self):
        return reverse('selectioncriterion-detail', args=[self.id])

class ServiceTag(models.Model):
    name = models.CharField(_('tag name'), max_length=255)


class Service(TranslatableModel, models.Model):
    slug = models.SlugField(unique=True, max_length=512, null=True,
                            help_text=_('This field has to be unique'))

    __translatable__ = {
        "name": lambda l: models.CharField(
            _("Name in {LANGUAGE_NAME}".format(**l)),
            max_length=256,
            default='',
            blank=True,
        ),
        "description": lambda l: models.TextField(
            # Translators: Service description
            _("Description in {LANGUAGE_NAME}".format(**l)),
            default='',
            blank=True,
        ),
        "address_city": lambda l: models.TextField(
            # Translators: Service description
            _("Address (city) in {LANGUAGE_NAME}".format(**l)),
            default='',
            blank=True,
            null=True,
        ),
        "address": lambda l: models.TextField(
            # Translators: Service description
            _("Address (street) in {LANGUAGE_NAME}".format(**l)),
            default='',
            blank=True,
            null=True,
        ),
        "additional_info": lambda l: models.TextField(
            _("Additional information in {LANGUAGE_NAME}".format(**l)),
            blank=True,
            default='',
        ),
        "address_floor": lambda l: models.TextField(
            blank=True,
            null=True
        ),
        "languages_spoken": lambda l: models.TextField(
            _("Languages spoken in {LANGUAGE_NAME}".format(**l)),
            blank=True,
            default='',
        ),
    }

    address_in_country_language = models.TextField(_("Address in country language"), blank=True, null=True)

    provider = models.ForeignKey(
        Provider,
        verbose_name=_("provider"),
        related_name="services"
    )

    region = models.ForeignKey(
        region_models.GeographicRegion,
        verbose_name=_("area of service"),
    )

    cost_of_service = models.TextField(
        _("cost of service"),
        blank=True,
        default='',
    )
    is_mobile = models.BooleanField(
        _("mobile service"),
        blank=True,
        default=False,
    )

    phone_number = models.CharField(
        verbose_name=_("phone number"),
        max_length=40,
        blank=True,
        null=True,
        help_text=_('Use ISO phone numbers with no spaces, ex: +3815551234'),
        validators=[
        ]
    )

    # Note: we don't let multiple non-archived versions of a service record pile up
    # there should be no more than two, one in current status and/or one in some other
    # status.
    STATUS_DRAFT = 'draft'
    STATUS_PRIVATE = 'private'
    STATUS_CURRENT = 'current'
    STATUS_REJECTED = 'rejected'
    STATUS_CANCELED = 'canceled'
    STATUS_ARCHIVED = 'archived'
    STATUS_CHOICES = (
        # New service or edit of existing service is pending approval
        (STATUS_DRAFT, _('draft')),
        # This Service has been approved and not superseded. Only services with
        # status 'current' appear in the public interface.
        (STATUS_CURRENT, _('current')),
        # The staff has rejected the service submission or edit
        (STATUS_REJECTED, _('rejected')),
        # The provider has canceled service. They can do this on draft or current services.
        # It no longer appears in the public interface.
        (STATUS_CANCELED, _('canceled')),
        # The record is obsolete and we don't want to see it anymore
        (STATUS_ARCHIVED, _('archived')),

        # Show only in the backend
        (STATUS_PRIVATE, _('private')),
    )
    status = models.CharField(
        _('status'),
        max_length=10,
        choices=STATUS_CHOICES,
        default=STATUS_DRAFT,
    )
    update_of = models.ForeignKey(
        'self',
        help_text=_('If a service record represents a modification of another service '
                    'record, this field links to that other record.'),
        null=True,
        blank=True,
        related_name='updates',
    )

    location = models.PointField(
        _('location'),
        blank=True,
        null=True,
    )

    # Open & close hours by day. If None, service is closed that day.
    sunday_open = models.TimeField(null=True, blank=True)
    sunday_close = models.TimeField(null=True, blank=True)
    monday_open = models.TimeField(null=True, blank=True)
    monday_close = models.TimeField(null=True, blank=True)
    tuesday_open = models.TimeField(null=True, blank=True)
    tuesday_close = models.TimeField(null=True, blank=True)
    wednesday_open = models.TimeField(null=True, blank=True)
    wednesday_close = models.TimeField(null=True, blank=True)
    thursday_open = models.TimeField(null=True, blank=True)
    thursday_close = models.TimeField(null=True, blank=True)
    friday_open = models.TimeField(null=True, blank=True)
    friday_close = models.TimeField(null=True, blank=True)
    saturday_open = models.TimeField(null=True, blank=True)
    saturday_close = models.TimeField(null=True, blank=True)

    # Saved as JSON, with format enabling possibility for multiple shift on one day (in 24 hour format):
    # { '24/7': True/False,
    #   'monday': [ {'open': 'HH:mm:ss', 'close': 'HH:mm:ss'}, ... ],
    #   'tuesday': [ {}, ... ],
    #   ...
    # }
    opening_time = models.TextField(null=True, blank=True)

    type = models.ForeignKey(
        ServiceType,
        verbose_name=_("type"),
        blank=True,
        null=True,
        related_name="service_type"
    )

    types = models.ManyToManyField(
        ServiceType,
        verbose_name=_("types"),
        blank=True
    )

    objects = models.GeoManager()

    image = ImageField(
        upload_to="service-images/",
        help_text=_(
            "Upload an image file (GIF, JPEG, PNG, WebP) with a square aspect "
            "ratio (Width equal to Height). The image size should be at least "
            "1280 x 1280 for best results. SVG files are not supported."),
        blank=True,
        default='',
    )
    foreign_object_id = models.IntegerField(blank=True, null=True)
    updated_at = models.DateTimeField(auto_now=True, blank=True)
    created_at = models.DateTimeField(blank=True, null=True)
    tags = models.ManyToManyField(
        ServiceTag,
        verbose_name=_('service tags'),
        blank=True,
        help_text=_('Specific tags for this service.')
    )
    facebook_page = models.CharField(
        _('Link to facebook page'),
        max_length=255,
        blank=True,
        default=''
    )
    website = models.CharField(
        _("website"),
        max_length=255,
        blank=True,
        default=''
    )
    email = models.EmailField(
        verbose_name=_('email address'),
        max_length=255,
        blank=True,
        default='',
    )

    focal_point_first_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    focal_point_last_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    focal_point_email = models.EmailField(
        max_length=255,
        blank=True,
        null=True
    )

    second_focal_point_first_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    second_focal_point_last_name = models.CharField(
        max_length=255,
        blank=True,
        null=True
    )

    second_focal_point_email = models.EmailField(
        max_length=255,
        blank=True,
        null=True
    )

    confirmation_key = models.CharField(max_length=255, default='')
    newsletter_valid_emails = models.CharField(max_length=255, default='')
    exclude_from_confirmation = models.BooleanField(default=False)    

    def get_api_url(self):
        return reverse('service-detail', args=[self.id])

    def get_absolute_url(self):
        """Called from CMS-related code to get app view from a search hit"""
        return get_path_to_service(self.id)

    def get_provider_fetch_url(self):
        # For convenience of the serializer
        return self.provider.get_fetch_url()

    def get_admin_edit_url(self):
        return reverse('admin:services_service_change', args=[self.id])

    def get_rating(self):
        ratings = Feedback.objects.filter(service=self, quality__isnull=False) \
            .values_list('quality', flat=True)
        if ratings:
            return sum(ratings) / len(ratings)
        return 0

    def email_provider_about_approval(self):
        """Schedule a task to send an email to the provider"""
        email_provider_about_service_approval_task.delay(self.pk)

    def email_provider_about_rejection(self):
        """Schedule a task to send an email to the provider"""
        email_provider_about_service_rejection_task.delay(self.pk)

    def may_approve(self):
        return self.status == self.STATUS_DRAFT

    def may_reject(self):
        return self.status == self.STATUS_DRAFT

    def cancel(self):
        """
        Cancel a pending service update, or withdraw a current service
        from the directory.
        """
        # First cancel any pending changes to this service
        for pending_change in self.updates.filter(status=Service.STATUS_DRAFT):
            pending_change.cancel()

        previous_status = self.status
        self.status = Service.STATUS_CANCELED
        self.save()

        if previous_status == Service.STATUS_DRAFT:
            JiraUpdateRecord.objects.create(
                service=self,
                update_type=JiraUpdateRecord.CANCEL_DRAFT_SERVICE)
        elif previous_status == Service.STATUS_CURRENT:
            JiraUpdateRecord.objects.create(
                service=self,
                update_type=JiraUpdateRecord.CANCEL_CURRENT_SERVICE)

    def save(self, *args, **kwargs):
        new_service = self.pk is None
        superseded_draft = None

        if not new_service:
            old_service = Service.objects.get(pk=self.pk)
            if not old_service.focal_point_email and not old_service.second_focal_point_email:
                if self.focal_point_email or self.second_focal_point_email:
                    ServiceConfirmationLog.objects.create(
                        service=self,
                        status=ServiceConfirmationLog.FOCAL_POINT_ADDED,
                        note='Focal point added.',
                        sent_to='-'
                    )

        with atomic():  # All or none of this
            if (new_service
                and self.status == Service.STATUS_DRAFT
                and self.update_of
                and self.update_of.status == Service.STATUS_DRAFT):
                # Any edit of a record that's still in review means we're
                # superseding one draft with another.
                superseded_draft = self.update_of
                # Bump this one up a level - we're replacing a pending change.
                self.update_of = superseded_draft.update_of

            # If it's mobile, force the location to the center of the area
            if self.is_mobile:
                self.location = self.region.centroid

            super().save(*args, **kwargs)

            if new_service:
                # Now we've safely saved this new record.
                # Did we replace an existing draft? Archive the previous one.
                if superseded_draft:
                    superseded_draft.status = Service.STATUS_ARCHIVED
                    superseded_draft.save()
                    JiraUpdateRecord.objects.create(
                        service=self,
                        superseded_draft=superseded_draft,
                        update_type=JiraUpdateRecord.SUPERSEDED_DRAFT)
                elif self.update_of:
                    # Submitted a proposed change to an existing service
                    JiraUpdateRecord.objects.create(
                        service=self,
                        update_type=JiraUpdateRecord.CHANGE_SERVICE)
                else:
                    # Submitted a new service
                    JiraUpdateRecord.objects.create(
                        service=self,
                        update_type=JiraUpdateRecord.NEW_SERVICE)

    def validate_for_approval(self):
        """
        Raise a ValidationError if this service's data doesn't look valid to
        be a current, approved service.

        Current checks:

        * self.full_clean()
        * .location must be set
        * at least one language field for each of several translated fields must be set
        * status must be DRAFT
        """
        try:
            self.full_clean()
        except ValidationError as e:
            errs = e.error_dict
        else:
            errs = {}
        if not self.location:
            errs['location'] = [_('This field is required.')]
        for field in ['name', 'description']:
            if not any([getattr(self, '%s_%s' % (field, lang)) for lang in ['en', 'ar', 'fr']]):
                errs[field] = [_('This field is required.')]
        if self.status != Service.STATUS_DRAFT:
            errs['status'] = [_('Only services in draft status may be approved.')]
        if errs:
            raise ValidationError(errs)

    def staff_approve(self, staff_user):
        """
        Staff approving the service (new or changed).

        :param staff_user: The user who approved
        :raises: ValidationErrror
        """
        # Make sure it's ready
        self.validate_for_approval()
        # if there's already a current record, archive it
        if self.update_of and self.update_of.status == Service.STATUS_CURRENT:
            self.update_of.status = Service.STATUS_ARCHIVED
            self.update_of.save()
        self.status = Service.STATUS_CURRENT
        self.save()
        self.email_provider_about_approval()
        JiraUpdateRecord.objects.create(
            service=self,
            update_type=JiraUpdateRecord.APPROVE_SERVICE,
            by=staff_user
        )

    def validate_for_rejecting(self):
        """
        Raise a ValidationError if this service's data doesn't look valid to
        be rejected.

        Current checks:

        * self.full_clean()
        * status must be DRAFT
        """
        try:
            self.full_clean()
        except ValidationError as e:
            errs = e.error_dict
        else:
            errs = {}
        if self.status != Service.STATUS_DRAFT:
            errs['status'] = [_('Only services in draft status may be rejected.')]
        if errs:
            raise ValidationError(errs)

    def staff_reject(self, staff_user):
        """
        Staff rejecting the service (new or changed)

        :param staff_user: The user who rejected
        """
        # Make sure it's ready
        self.validate_for_rejecting()
        self.status = Service.STATUS_REJECTED
        self.save()
        self.email_provider_about_rejection()
        JiraUpdateRecord.objects.create(
            service=self,
            update_type=JiraUpdateRecord.REJECT_SERVICE,
            by=staff_user
        )

    @property
    def longitude(self):
        if self.location:
            return self.location[0]

    @longitude.setter
    def longitude(self, value):
        if self.location is None:
            self.location = Point(0, 0)
        self.location[0] = value

    @property
    def latitude(self):
        if self.location:
            return self.location[1]

    @latitude.setter
    def latitude(self, value):
        if self.location is None:
            self.location = Point(0, 0)
        self.location[1] = value

    def get_thumbnail_url(self):
        """Shortcut to get the URL for an image thumbnail."""
        thumbnail = get_thumbnail(self.image, '100x100', crop='center', quality=99)
        return thumbnail.url if thumbnail else None

    def confirm(self, confirmation_key, log_status, note=None):
        """Service confirmation for focal points"""
        if self.confirmation_key != 'USED' and self.confirmation_key == confirmation_key:
            ServiceConfirmationLog.objects.create(
                service=self,
                status=log_status,
                note=note if note else 'Confirmed by Focal Point',
                sent_to=self.newsletter_valid_emails if self.newsletter_valid_emails else self.focal_point_email
            )
            self.confirmation_key = 'USED'
            self.save()
            if self.newsletter_valid_emails:
                # Sending 'Thank you' email after confirmation.
                subject = 'Refugee.Info {} Service Map, {} Update - {}'.format(self.region.name,
                                                                               datetime.now().strftime("%B"),
                                                                               self.provider.name)
                newsletter_settings = NewsletterEmailTemplate.objects.filter(type__in=[
                    NewsletterEmailTemplate.SERVICE_THANKS, NewsletterEmailTemplate.SERVICE_BASE])
                newsletter_settings = {x.name: x.value for x in list(newsletter_settings)}
                content_html = render_to_string('service_newsletter/thanks.html', context={
                    'newsletter_settings': newsletter_settings
                })

                with get_connection(
                        host=settings.NEWSLETTER_FROM_EMAIL_HOST,
                        port=settings.NEWSLETTER_FROM_EMAIL_PORT,
                        username=settings.NEWSLETTER_FROM_EMAIL_HOST_USER,
                        password=settings.NEWSLETTER_FROM_EMAIL_HOST_PASSWORD,
                        user_tls=settings.NEWSLETTER_FROM_EMAIL_USE_TLS
                ) as connection:
                    send_mail(
                        subject=subject,
                        message='Thank you',
                        from_email=settings.NEWSLETTER_FROM_EMAIL,
                        recipient_list=self.newsletter_valid_emails.split(", "),
                        html_message=content_html,
                        connection=connection)

                # Send report confirmation e-mail
                city = ", " + self.address_city if self.address_city else ''
                subject = 'Updates for ' + self.provider.name + city
                content_html = render_to_string('service_newsletter/report.html', context={
                    'service': self,
                    'api_url': settings.API_URL,
                    'note': note if note else ''
                })

                send_mail(
                    subject=subject,
                    message='Report',
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[settings.SERVICE_MANAGER_EMAIL],
                    html_message=content_html)

            return self
        else:
            msg = _('Confirmation key is invalid or has already been used.')
            raise ValidationError(msg)


class ServiceConfirmationLog(models.Model):
    CONFIRMED = 'confirmed'
    PENDING = 'pending'
    PENDING_REMINDER = 'pending_reminder'
    PENDING_UNCONFIRMED_REMINDER = 'pending_unconfirmed_reminder'
    OUTDATED = 'outdated'
    ERROR = 'error'
    FOCAL_POINT_ADDED = 'focal_point_added'
    STATUSES = (
        (CONFIRMED, _('Confirmed')),
        (PENDING, _('Pending')),
        (PENDING_REMINDER, _('Pending after reminder')),
        (PENDING_UNCONFIRMED_REMINDER, _('Pending after unconfirmed reminder')),
        (OUTDATED, _('Service needs update')),
        (ERROR, _('Error occurred during email sending')),
        (FOCAL_POINT_ADDED, _('Focal point added'))
    )
    service = models.ForeignKey(Service, related_name='confirmation_logs')
    date = models.DateTimeField(auto_now=True, blank=True)
    status = models.CharField(max_length=255, null=True, blank=True, choices=STATUSES)
    sent_to = models.EmailField(max_length=255, null=True, blank=True)
    note = models.TextField(null=True, blank=True)


class JiraUpdateRecord(models.Model):
    service = models.ForeignKey(Service, blank=True, null=True, related_name='jira_records')
    superseded_draft = models.ForeignKey(Service, blank=True, null=True)
    provider = models.ForeignKey(Provider, blank=True, null=True, related_name='jira_records')
    feedback = models.ForeignKey(
        'services.Feedback', blank=True, null=True, related_name='jira_records')
    request_for_service = models.ForeignKey(
        'services.RequestForService', blank=True, null=True, related_name='jira_records')
    PROVIDER_CHANGE = 'provider-change'
    NEW_SERVICE = 'new-service'
    CHANGE_SERVICE = 'change-service'
    CANCEL_DRAFT_SERVICE = 'cancel-draft-service'
    CANCEL_CURRENT_SERVICE = 'cancel-current-service'
    SUPERSEDED_DRAFT = 'superseded-draft'
    APPROVE_SERVICE = 'approve-service'
    REJECT_SERVICE = 'rejected-service'
    FEEDBACK = 'feedback'
    REQUEST_FOR_SERVICE = 'request-for-service'
    UPDATE_CHOICES = (
        (PROVIDER_CHANGE, _('Provider updated their information')),
        (NEW_SERVICE, _('New service submitted by provider')),
        (CHANGE_SERVICE, _('Change to existing service submitted by provider')),
        (CANCEL_DRAFT_SERVICE, _('Provider canceled a draft service')),
        (CANCEL_CURRENT_SERVICE, _('Provider canceled a current service')),
        (SUPERSEDED_DRAFT, _('Provider superseded a previous draft')),
        (APPROVE_SERVICE, _('Staff approved a new or changed service')),
        (REJECT_SERVICE, _('Staff rejected a new or changed service')),
        (FEEDBACK, _('User submitted feedback')),
        (REQUEST_FOR_SERVICE, _('User submitted request for service.')),
    )
    # Update types that indicate a new Service record was created
    NEW_SERVICE_RECORD_UPDATE_TYPES = [
        NEW_SERVICE, CHANGE_SERVICE, SUPERSEDED_DRAFT,
    ]
    # Update types that indicate a draft or service is being canceled/deleted
    END_SERVICE_UPDATE_TYPES = [
        CANCEL_DRAFT_SERVICE, CANCEL_CURRENT_SERVICE,
    ]
    STAFF_ACTION_SERVICE_UPDATE_TYPES = [
        APPROVE_SERVICE, REJECT_SERVICE
    ]
    SERVICE_CHANGE_UPDATE_TYPES = (
        NEW_SERVICE_RECORD_UPDATE_TYPES + END_SERVICE_UPDATE_TYPES
        + STAFF_ACTION_SERVICE_UPDATE_TYPES
    )
    PROVIDER_CHANGE_UPDATE_TYPES = [
        PROVIDER_CHANGE,
    ]
    NEW_JIRA_RECORD_UPDATE_TYPES = [
        NEW_SERVICE, CHANGE_SERVICE, CANCEL_CURRENT_SERVICE, PROVIDER_CHANGE
    ]
    update_type = models.CharField(
        _('update type'),
        max_length=max([len(x[0]) for x in UPDATE_CHOICES]),
        choices=UPDATE_CHOICES,
    )
    jira_issue_key = models.CharField(
        _("JIRA issue"),
        max_length=256,
        blank=True,
        default='')
    by = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        null=True,
        blank=True,
    )

    class Meta(object):
        # The service udpate types can each only happen once per service
        unique_together = (('service', 'update_type'),)

    def save(self, *args, **kwargs):
        errors = []
        is_new = self.pk is None
        if self.update_type == '':
            errors.append('must have a non-blank update_type')
        elif self.update_type == self.FEEDBACK:
            if not self.feedback:
                errors.append('%s must specify feedback' % self.update_type)
        elif self.update_type == self.REQUEST_FOR_SERVICE:
            if not self.request_for_service:
                errors.append('%s must specify request for service' % self.update_type)
        elif self.update_type in self.PROVIDER_CHANGE_UPDATE_TYPES:
            if not self.provider:
                errors.append('%s must specify provider' % self.update_type)
            if self.service:
                errors.append('%s must not specify service' % self.update_type)
        elif self.update_type in self.SERVICE_CHANGE_UPDATE_TYPES:
            if self.service:
                if self.update_type == self.NEW_SERVICE and self.service.update_of:
                    errors.append('%s must not specify a service that is an update of another'
                                  % self.update_type)
                # If we're not creating a new record, be more tolerant; the service might
                # have been updated one way or another.
                if (is_new and self.update_type == self.CHANGE_SERVICE
                    and not self.service.update_of):
                    errors.append('%s must specify a service that is an update of another'
                                  % self.update_type)
            else:
                errors.append('%s must specify service' % self.update_type)
            if self.provider:
                errors.append('%s must not specify provider' % self.update_type)
            if self.update_type == self.SUPERSEDED_DRAFT and not self.superseded_draft:
                errors.append('%s must specifiy superseded draft service')
        else:
            errors.append('unrecognized update_type: %s' % self.update_type)
        if self.update_type in self.STAFF_ACTION_SERVICE_UPDATE_TYPES:
            if not self.by:
                errors.append('%s must specify user in "by" field')

        if errors:
            raise Exception('%s cannot be saved: %s' % (str(self), ', '.join(e for e in errors)))
        super().save(*args, **kwargs)

    def do_jira_work(self, jira=None):
        sentinel_value = 'PENDING'
        # Bail out early if we don't yet have a pk, if we already have a JIRA
        # issue key set, or if some other thread is already working on getting
        # an issue created/updated.
        if not self.pk or JiraUpdateRecord.objects.filter(pk=self.pk, jira_issue_key='').update(
                jira_issue_key=sentinel_value) != 1:
            return

        try:
            if not jira:
                jira = jira_support.get_jira()

            if self.update_type in JiraUpdateRecord.NEW_JIRA_RECORD_UPDATE_TYPES:
                kwargs = jira_support.default_newissue_kwargs()
                service = None
                service_url = None
                change_type = {
                    JiraUpdateRecord.NEW_SERVICE: 'New service',
                    JiraUpdateRecord.CHANGE_SERVICE: 'Changed service',
                    JiraUpdateRecord.CANCEL_CURRENT_SERVICE: 'Canceled service',
                    JiraUpdateRecord.PROVIDER_CHANGE: 'Changed provider',
                }[self.update_type]
                if self.update_type in JiraUpdateRecord.SERVICE_CHANGE_UPDATE_TYPES:
                    service = self.service
                    service_url = absolute_url(service.get_admin_edit_url())
                    provider = self.service.provider
                elif self.update_type in self.PROVIDER_CHANGE_UPDATE_TYPES:
                    provider = self.provider
                kwargs['summary'] = '%s from %s' % (change_type, provider)
                template_name = {
                    JiraUpdateRecord.NEW_SERVICE: 'jira/new_service.txt',
                    JiraUpdateRecord.CHANGE_SERVICE: 'jira/changed_service.txt',
                    JiraUpdateRecord.CANCEL_CURRENT_SERVICE: 'jira/canceled_service.txt',
                    JiraUpdateRecord.PROVIDER_CHANGE: 'jira/changed_provider.txt',
                }[self.update_type]
                context = {
                    'site': Site.objects.get_current(),
                    'provider': provider,
                    'provider_url': absolute_url(provider.get_admin_edit_url()),
                    'service': service,
                    'service_url': service_url,
                }
                if service and service.update_of:
                    context['service_parent_url'] = \
                        absolute_url(service.update_of.get_admin_edit_url())
                kwargs['description'] = render_to_string(template_name, context)
                new_issue = jira.create_issue(**kwargs)
                self.jira_issue_key = new_issue.key
                self.save()
            elif self.update_type == self.SUPERSEDED_DRAFT:
                # Track down the issue that's already been created so we
                # can comment on it.
                previous_record = JiraUpdateRecord.objects.get(service=self.superseded_draft)
                issue_key = previous_record.jira_issue_key
                context = {
                    'service': self.service,
                    'service_url': absolute_url(self.service.get_admin_edit_url()),
                }
                comment = render_to_string('jira/superseded_draft.txt', context)
                jira.add_comment(issue_key, comment)
                self.jira_issue_key = issue_key
                self.save()
            elif self.update_type == self.CANCEL_DRAFT_SERVICE:
                # Track down the issue that's already been created so we
                # can comment on it.
                previous_record = JiraUpdateRecord.objects.get(
                    update_type__in=JiraUpdateRecord.NEW_SERVICE_RECORD_UPDATE_TYPES,
                    service=self.service
                )
                issue_key = previous_record.jira_issue_key
                comment = 'Pending draft change was canceled by the provider.'
                jira.add_comment(issue_key, comment)
                self.jira_issue_key = issue_key
                self.save()
            elif self.update_type in self.STAFF_ACTION_SERVICE_UPDATE_TYPES:
                # Track down the issue that's already been created so we
                # can comment on it.
                previous_record = JiraUpdateRecord.objects.get(
                    update_type__in=JiraUpdateRecord.NEW_SERVICE_RECORD_UPDATE_TYPES,
                    service=self.service
                )
                issue_key = previous_record.jira_issue_key
                messages = {
                    (self.NEW_SERVICE, self.APPROVE_SERVICE):
                        "The new service was approved by %s.",
                    (self.NEW_SERVICE, self.REJECT_SERVICE):
                        "The new service was rejected by %s.",
                    (self.CHANGE_SERVICE, self.APPROVE_SERVICE):
                        "The service change was approved by %s.",
                    (self.CHANGE_SERVICE, self.REJECT_SERVICE):
                        "The service change was rejected by %s.",
                }
                comment = messages.get((previous_record.update_type, self.update_type),
                                       "The service's state was updated by %s.")
                comment = comment % self.by.email
                jira.add_comment(issue_key, comment)
                self.jira_issue_key = issue_key
                self.save()
            elif self.update_type == self.FEEDBACK:
                kwargs = jira_support.default_feedback_kwargs()
                kwargs['summary'] = 'Feedback about %s' % (self.feedback.service,)
                context = {
                    'site': Site.objects.get_current(),
                    'feedback': self.feedback,
                    'service': self.feedback.service,
                    'service_url': absolute_url(self.feedback.service.get_admin_edit_url()),
                    'provider': self.feedback.service.provider,
                }
                template_name = 'jira/feedback.txt'
                kwargs['description'] = render_to_string(template_name, context)
                new_issue = jira.create_issue(**kwargs)
                self.jira_issue_key = new_issue.key
                self.save()
            elif self.update_type == self.REQUEST_FOR_SERVICE:
                kwargs = jira_support.default_request_for_service_kwargs()
                kwargs['summary'] = 'Request service to be added: %s' % (
                    self.request_for_service.service_name,)
                context = {
                    'rfs': self.request_for_service,
                    'rfs_url': absolute_url(self.request_for_service.get_admin_edit_url()),
                }
                template_name = 'jira/request_for_service.txt'
                kwargs['description'] = render_to_string(template_name, context)
                new_issue = jira.create_issue(**kwargs)
                self.jira_issue_key = new_issue.key
                self.save()

        finally:
            # If we've not managed to save a valid JIRA issue key, reset value to
            # empty string so it'll be tried again later.
            JiraUpdateRecord.objects.filter(pk=self.pk, jira_issue_key=sentinel_value).update(
                jira_issue_key='')


class NewsletterEmailTemplate(models.Model):
    name = models.CharField(
        max_length=255,
        blank=False,
        null=False,
        unique=True
    )
    label = models.CharField(
        max_length=255,
        null=True,
        blank=True
    )
    value = RichTextField(blank=True)
    SERVICE_BASE = 'service_base'
    SERVICE_CONFIRMATION = 'service_confirmation'
    SERVICE_REMINDER = 'service_reminder'
    SERVICE_THANKS = 'service_thanks'
    TYPE_CHOICES = (
        (SERVICE_BASE, _('service_base')),
        (SERVICE_CONFIRMATION, _('service_base')),
        (SERVICE_REMINDER, _('service_base')),
        (SERVICE_THANKS, _('service_base'))
    )
    type = models.CharField(
        _('type'),
        max_length=20,
        choices=TYPE_CHOICES,
        default=SERVICE_BASE
    )
    order = models.IntegerField(null=True)

#
# FEEDBACK
#
class Nationality(TranslatableModel, models.Model):
    __translatable__ = {
        "name": lambda l: models.CharField(
            _("name in {LANGUAGE_NAME}".format(**l)),
            max_length=256,
            default='',
            blank=True,
        ),
    }

    number = models.IntegerField(unique=True)

    class Meta:
        verbose_name_plural = _("nationalities")

    def get_api_url(self):
        return reverse('nationality-detail', args=[self.id])


class Feedback(models.Model):
    # About the user
    name = models.CharField(
        _("Name"),
        max_length=256
    )
    phone_number = models.CharField(
        _("Phone Number"),
        max_length=20,
        validators=[
        ],
        blank=True,
        null=True
    )
    nationality = models.ForeignKey(
        verbose_name=_("Nationality"),
        to=Nationality,
        blank=True,
        null=True
    )
    area_of_residence = models.ForeignKey(
        ServiceArea,
        verbose_name=_("Area of residence"),
        blank=True,
        null=True
    )

    # The service getting feedback
    service = models.ForeignKey(
        verbose_name=_("Service"),
        to=Service,
    )

    # Questions about delivery of service
    delivered = models.NullBooleanField(
        help_text=_("Was service delivered?"),
        default=False,  # Don't really want a default here, but Django screams at you,
        blank=True,
        null=True
    )
    quality = models.SmallIntegerField(
        help_text=_("How would you rate the quality of the service you received (from 1 to 5, "
                    "where 5 is the highest rating possible)?"),
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ],
        default=None,
        blank=True,
        null=True,
    )
    non_delivery_explained = models.CharField(
        # This is required only if 'delivered' is false; so needs to be optional here
        # and we'll validate that elsewhere
        help_text=_("Did you receive a clear explanation for why the service you "
                    "sought was not delivered to you?"),
        blank=True,
        default=None,
        null=True,
        max_length=8,
        choices=[
            ('no', _("No explanation")),
            ('unclear', _("Explanation was not clear")),
            ('unfair', _("Explanation was not fair")),
            ('yes', _("Clear and appropriate explanation")),
        ]
    )
    wait_time = models.CharField(
        # Presumably, only required if 'delivered' is true
        help_text=_("How long did you wait for the service to be delivered, after "
                    "contacting the service provider?"),
        blank=True,
        null=True,
        default=None,
        max_length=12,
        choices=[
            ('lesshour', _("Less than 1 hour")),
            ('uptotwodays', _("Up to 2 days")),
            ('3-7days', _("3-7 days")),
            ('1-2weeks', _("1-2 weeks")),
            ('more', _("More than 2 weeks")),
        ]
    )
    wait_time_satisfaction = models.SmallIntegerField(
        help_text=_("How do you rate your satisfaction with the time that you waited for "
                    "the service to be delivered (from 1 to 5, where 5 is the highest "
                    "rating possible)?"),
        default=None,
        null=True,
        blank=True,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )

    difficulty_contacting = models.CharField(
        help_text=_("Did you experience difficulties contacting the provider of "
                    "the service you needed?"),
        max_length=20,
        choices=[
            ('no', _("No")),
            ('didntknow', _("Did not know how to contact them")),
            ('nophoneresponse', _("Tried to contact them by phone but received no response")),
            ('noresponse', _("Tried to contact them in person but received no response or "
                             "did not find their office")),
            ('unhelpful', _("Contacted them but response was unhelpful")),
            ('other', _("Other")),
        ]
    )
    other_difficulties = models.TextField(
        # Only if 'other' selected above
        help_text=_("Other difficulties contacting the service provider"),
        blank=True,
        default='',
    )
    staff_satisfaction = models.SmallIntegerField(
        help_text=_("How would you rate your satisfaction with the staff of the organization "
                    "that provided services to you, (from 1 to 5, where 5 is the highest "
                    "rating possible)?"),
        blank=True,  # Only required if service was delivered
        null=True,
        default=None,
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ]
    )
    extra_comments = models.TextField(
        help_text=_("Other comments"),
        default='',
        blank=True,
    )
    anonymous = models.BooleanField(
        help_text=_("I want my feedback to be anonymous to the service provider"),
        default=False,
    )

    def clean(self):
        errs = defaultdict(list)
        if self.delivered:
            if self.quality is None:
                errs['quality'].append(
                    _("Quality field is required if you answered 'Yes' to "
                      "'Was the service you sought delivered to you?'."))
            if self.wait_time is None:
                errs['wait_time'].append(
                    _("An answer is required to 'How long did you wait for the service to "
                      "be delivered, after contacting the service provider?' "
                      "if you answered 'Yes' to "
                      "'Was the service you sought delivered to you?'."))
            if self.wait_time_satisfaction is None:
                errs['wait_time_satisfaction'].append(
                    _("An answer is required to 'How do you rate your satisfaction with the "
                      "time that you waited for the service to be delivered?' "
                      "if you answered 'Yes' to "
                      "'Was the service you sought delivered to you?'.")
                )
        else:
            if self.non_delivery_explained is None:
                errs['non_delivery_explained'].append(
                    _("An answer is required to 'Did you receive a clear explanation for "
                      "why the service you sought was not delivered to you?' "
                      "if you answered 'No' to "
                      "'Was the service you sought delivered to you?'."))
        if self.difficulty_contacting == 'other':
            if not self.other_difficulties:
                errs['other_difficulties'].append(
                    _("An answer is required to 'Other difficulties contacting the service "
                      "provider' "
                      "if you answered 'Other' to 'Did you experience difficulties contacting "
                      "the provider of the service you needed?'")
                )

        if errs:
            raise ValidationError(errs)

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.pk:
            JiraUpdateRecord.objects.create(
                feedback=self,
                update_type=JiraUpdateRecord.FEEDBACK
            )

    def get_api_url(self):
        """Return the PATH part of the URL to access this object using the API"""
        return reverse('feedback-detail', args=[self.id])


class RequestForService(models.Model):
    provider_name = models.CharField(
        max_length=256,
        validators=[at_least_one_letter]
    )
    service_name = models.CharField(
        max_length=256,
        validators=[at_least_one_letter]
    )
    area_of_service = models.ForeignKey(
        ServiceArea,
        verbose_name=_("area of service"),
    )
    service_type = models.ForeignKey(
        ServiceType,
        verbose_name=_("type"),
    )
    address = models.TextField()
    contact = models.TextField()
    description = models.TextField()
    rating = models.SmallIntegerField(
        help_text=_("How would you rate the quality of the service you received (from 1 to 5, "
                    "where 5 is the highest rating possible)?"),
        validators=[
            MinValueValidator(1),
            MaxValueValidator(5)
        ],
        default=None,
        blank=True,
        null=True,
    )

    def save(self, *args, **kwargs):
        super().save(*args, **kwargs)
        if self.pk:
            JiraUpdateRecord.objects.create(
                request_for_service=self,
                update_type=JiraUpdateRecord.REQUEST_FOR_SERVICE
            )

    def get_admin_edit_url(self):
        """Return the PATH part of the URL to edit this object in the admin"""
        return reverse('admin:services_requestforservice_change', args=[self.id])

class ContactInformation(models.Model):        
    service = models.ForeignKey(
        verbose_name=_("Service"),
        to=Service,
        null=True,
        blank=True,
        related_name='contact_information'
    )
    EMAIL = 'email'
    PHONE = 'phone'
    VIBER = 'viber'
    WHATSAPP = 'whatsapp'
    SKYPE = 'skype'
    FACEBOOK_MESSENGER = 'facebook_messenger'
    TYPE_CHOICES = (        
        (EMAIL, _('Email')),
        (PHONE, _('Phone')),
        (VIBER, _('Viber')),
        (WHATSAPP, _('Whatsapp')),
        (SKYPE, _('Skype')),
        (FACEBOOK_MESSENGER, _('Facebook Messenger')),
    )
    type = models.CharField(
        max_length=20,
        choices=TYPE_CHOICES,
        blank=True,
        null=True,
        default=None
    )    
    text = models.CharField(
        max_length=256)

    index = models.SmallIntegerField(
        validators=[
            MinValueValidator(0),            
            MaxValueValidator(1000000)
        ],
        default=0,
        blank=False,
        null=False,
    )
class UserNote(models.Model):
    service = models.ForeignKey(
        verbose_name=_("Service"),
        to=Service,
        null=False,
        blank=False,
        related_name='service'
    )
    user = models.ForeignKey(
        to=settings.AUTH_USER_MODEL,
        verbose_name=_('User'),
        related_name='user',
        null=True,
        blank=True,
    )
    updated_at = models.DateTimeField(auto_now=True, blank=True)
    created_at = models.DateTimeField(blank=True, null=True)
    note = models.TextField()



    
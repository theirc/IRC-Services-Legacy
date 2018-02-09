from __future__ import absolute_import, unicode_literals, division, print_function

import json

import requests
from bs4 import BeautifulSoup
from celery.utils.log import get_task_logger
from . import cms_utils
from django.conf import settings
from services.models import Service

logger = get_task_logger(__name__)


def push_blog_post_to_transifex(blog_post):
    try:
        password = settings.TRANSIFEX_PASSWORD
        user = settings.TRANSIFEX_USER

        project = settings.TRANSIFEX_BLOG_PROJECT_SLUG

        transifex_url_data = {
            "project": project,
            "slug": blog_post['slug']
        }

        fetch_format = "https://www.transifex.com/api/2/project/{project}/resource/{slug}/"
        post_format = "https://www.transifex.com/api/2/project/{project}/resources/"

        r = requests.get(fetch_format.format(**transifex_url_data), auth=(user, password))

        is_new = r.status_code == 404

        html = "<html><head><title>{title}</title></head><body>{html}</body></html>".format(**blog_post)
        html = cms_utils.parse_html_for_translation(html)

        payload = {
            "content": html,
            "slug": transifex_url_data['slug'],
            "name": transifex_url_data['slug'] + '.html',
        }

        if is_new:
            payload.update({
                "i18n_type": 'HTML',
            })
            r2 = requests.post(post_format.format(**transifex_url_data),
                               headers={"Content-type": "application/json"},
                               auth=(user, password),
                               data=json.dumps(payload), )
            status = 'New'
            info = {'strings_added': json.loads(r2.text)[0]}
        else:
            r2 = requests.put(fetch_format.format(**transifex_url_data) + 'content/',
                              headers={"Content-type": "application/json"},
                              auth=(user, password),
                              data=json.dumps(payload), )
            status = 'Updated'
            info = json.loads(r2.text)

        logger.info(status + r2.text)

        r2.info = info
        r2.info['status'] = status
        return r2.json()
    except Exception as e:
        logger.exception("Error pushing to transifex")


def pull_blog_from_transifex(slug, language):
    project = settings.TRANSIFEX_BLOG_PROJECT_SLUG

    password = settings.TRANSIFEX_PASSWORD
    user = settings.TRANSIFEX_USER

    transifex_url_data = {
        "project": project,
        "slug": slug,
        "language": language
    }
    fetch_format = "https://www.transifex.com/api/2/project/{project}/resource/{slug}/translation/{language}/" \
                   "?mode=default"

    r = requests.get(fetch_format.format(**transifex_url_data), auth=(user, password))

    translation = r.json()
    html = cms_utils.parse_html_for_content(translation['content'])
    html = "\n".join(line.strip() for line in html.split("\n"))
    soup = BeautifulSoup(html)
    title = "".join([str(a) for a in soup.title])
    items = list(str(c) for c in soup.body.children if str(c) != '\n')
    previous_p = None
    body = ""
    for i in items:
        if '<p>' not in i:
            previous_p = "<p>" + i if not previous_p else previous_p + i
        else:
            if previous_p:
                body += previous_p + '</p>'
                previous_p = None
            body += i

    body = " ".join(line.strip() for line in body.split("\n"))
    body = body.replace('</p>', '</p>\n')
    mobiledoc = json.loads("""{"version":"0.3.1","markups":[],"atoms":[],"cards":[["card-markdown",{"cardName":"card-markdown","markdown":""}]],"sections":[[10,0]]}""")
    mobiledoc['cards'][0][1]['markdown'] = body
    return {
        "slug": "{}-{}".format(slug, language),
        "markdown": body,
        "mobiledoc": json.dumps(mobiledoc),
        "html": body,
        "title": title,
    }


def get_blog_transifex_info(slug):
    password = settings.TRANSIFEX_PASSWORD
    user = settings.TRANSIFEX_USER
    project = settings.TRANSIFEX_BLOG_PROJECT_SLUG

    transifex_url_data = {
        "project": project,
        "slug": slug,
    }
    fetch_format = "https://www.transifex.com/api/2/project/{project}/resource/{slug}/stats/"

    transifex = requests.get(fetch_format.format(**transifex_url_data), auth=(user, password))

    if transifex.status_code == 200:
        return transifex.json()

    return {}


def push_service_to_transifex(id):
    try:
        service = Service.objects.get(id=id)
        service_json = {'name': service.name,
                        'description': service.description,
                        'address_city': service.address_city,
                        'address': service.address,
                        'address_floor': service.address_floor,
                        'additional_info': service.additional_info,
                        'languages_spoken': service.languages_spoken}

        password = settings.TRANSIFEX_PASSWORD
        user = settings.TRANSIFEX_USER

        project = settings.TRANSIFEX_SERVICES_PROJECT_SLUG

        transifex_url_data = {
            "project": project,
            "slug": service.slug
        }

        fetch_format = "https://www.transifex.com/api/2/project/{project}/resource/{slug}/"
        post_format = "https://www.transifex.com/api/2/project/{project}/resources/"

        r = requests.get(fetch_format.format(**transifex_url_data), auth=(user, password))

        is_new = r.status_code == 404

        payload = {
            "content": json.dumps(service_json),
            "slug": transifex_url_data['slug'],
            "name": transifex_url_data['slug'] + '.json',
        }

        if is_new:
            payload.update({
                "i18n_type": "KEYVALUEJSON",
            })
            r2 = requests.post(post_format.format(**transifex_url_data),
                               headers={"Content-type": "application/json"},
                               auth=(user, password),
                               data=json.dumps(payload), )
            status = 'New'
            info = {'strings_added': json.loads(r2.text)[0]}
        else:
            r2 = requests.put(fetch_format.format(**transifex_url_data) + 'content/',
                              headers={"Content-type": "application/json"},
                              auth=(user, password),
                              data=json.dumps(payload), )
            status = 'Updated'
            info = json.loads(r2.text)

        logger.info(status + r2.text)

        r2.info = info
        r2.info['status'] = status
        return r2
    except Exception as e:
        logger.exception("Error pushing to transifex")


def get_service_transifex_info(id):
    service = Service.objects.get(id=id)
    slug = service.slug
    password = settings.TRANSIFEX_PASSWORD
    user = settings.TRANSIFEX_USER
    project = settings.TRANSIFEX_SERVICES_PROJECT_SLUG

    transifex_url_data = {
        "project": project,
        "slug": slug,
    }
    fetch_format = "https://www.transifex.com/api/2/project/{project}/resource/{slug}/stats/"

    logger.info("Trying to request: %s" % fetch_format.format(**transifex_url_data))
    logger.info("With creds: %s %s" % (user, password))

    return requests.get(fetch_format.format(**transifex_url_data), auth=(user, password))


def pull_completed_service_from_transifex(id):
    try:
        service = Service.objects.get(id=id)
        slug = service.slug
        project = settings.TRANSIFEX_SERVICES_PROJECT_SLUG
        r = get_service_transifex_info(id)
        print("Received from transifex:", r.text)
        trans = r.json()
        response = []
        for language in trans.keys():
            if language in dict(settings.LANGUAGES_CMS):
                if language == 'en':
                    continue
                if trans[language]['completed'] == "100%":
                    response.append(language)
                    pull_from_transifex(service.id, language, project)
        return response
    except Exception as e:
        logger.exception('Error pulling completed from transifex')


def pull_from_transifex(id, language, project=settings.TRANSIFEX_SERVICES_PROJECT_SLUG):
    services = Service.objects.filter(id=id)

    try:
        service = services[0]
    except Exception as e:
        logger.info('Service not found.')
        raise e

    password = settings.TRANSIFEX_PASSWORD
    user = settings.TRANSIFEX_USER

    transifex_url_data = {
        "project": project,
        "slug": service.slug,
        "language": language
    }
    fetch_format = "https://www.transifex.com/api/2/project/{project}/resource/{slug}/translation/{language}/" \
                   "?mode=default"

    logger.info("Trying to request: %s" % fetch_format.format(**transifex_url_data))
    logger.info("With creds: %s %s" % (user, password))

    r = requests.get(fetch_format.format(**transifex_url_data), auth=(user, password))

    translation = r.json()

    translated_fields = json.loads(translation['content'])

    _translate_service(translated_fields, language, service)


def _translate_service(translation_dict, language, service):
    if language == 'ar':
        service.name_ar = translation_dict.get('name', '')
        service.description_ar = translation_dict.get('description', '')
        service.address_city_ar = translation_dict.get('address_city', '')
        service.address_ar = translation_dict.get('address', '')
        service.address_floor_ar = translation_dict.get('address_floor', '')
        service.additional_info_ar = translation_dict.get('additional_info', '')
        service.languages_spoken_ar = translation_dict.get('languages_spoken', '')
        service.save()
    elif language == 'fa':
        service.name_fa = translation_dict.get('name', '')
        service.description_fa = translation_dict.get('description', '')
        service.address_city_fa = translation_dict.get('address_city', '')
        service.address_fa = translation_dict.get('address', '')
        service.address_floor_fa = translation_dict.get('address_floor', '')
        service.additional_info_fa = translation_dict.get('additional_info', '')
        service.languages_spoken_fa = translation_dict.get('languages_spoken', '')
        service.save()
    else:
        logger.info('Got wrong language (other than arabic or farsi)')

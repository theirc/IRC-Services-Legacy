from __future__ import absolute_import, unicode_literals, division, print_function

import json
import html2text
import html
import re

import requests
from bs4 import BeautifulSoup
from celery.utils.log import get_task_logger
from . import cms_utils
from django.conf import settings
from services.models import Service
from django.db import connections
import pymysql.cursors

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

        r = requests.get(fetch_format.format(
            **transifex_url_data), auth=(user, password))

        is_new = r.status_code == 404

        html = "<html><head><title>{title}</title></head><body>{html}</body></html>".format(
            **blog_post)

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

    r = requests.get(fetch_format.format(
        **transifex_url_data), auth=(user, password))

    translation = r.json()
    html = translation['content']
    soup = BeautifulSoup(html)
    title = "".join([str(a) for a in soup.title])
    body = str(soup.body)

    body = "".join(line.strip() for line in body.split("\n"))
    md = html2text.html2text(str(body), bodywidth=1e4)

    mobiledoc = json.loads(
        """{"version":"0.3.1","markups":[],"atoms":[],"cards":[["card-markdown",{"cardName":"card-markdown","markdown":""}]],"sections":[[10,0]]}""")
    mobiledoc['cards'][0][1]['markdown'] = md
    return {
        "slug": "{}-{}".format(slug, language),
        "markdown": md,
        "mobiledoc": json.dumps(mobiledoc),
        "html": str(body),
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

    transifex = requests.get(fetch_format.format(
        **transifex_url_data), auth=(user, password))

    if transifex.status_code == 200:
        return transifex.json()

    return {}

def cleanUpHTML(s):
    return html.unescape(s)

def push_service_to_transifex(id):
    try:
        service = Service.objects.get(id=id)
        service_json = {
            'name': service.name,
            'description': cleanUpHTML(service.description),
            'address_city': service.address_city,
            'address': service.address,
            'address_floor': service.address_floor,
            'additional_info': cleanUpHTML(service.additional_info),
            'languages_spoken': service.languages_spoken
        }

        password = settings.TRANSIFEX_PASSWORD
        user = settings.TRANSIFEX_USER

        project = settings.TRANSIFEX_SERVICES_PROJECT_SLUG

        transifex_url_data = {
            "project": project,
            "slug": service.slug
        }

        fetch_format = "https://www.transifex.com/api/2/project/{project}/resource/{slug}/"
        post_format = "https://www.transifex.com/api/2/project/{project}/resources/"

        r = requests.get(fetch_format.format(
            **transifex_url_data), auth=(user, password))

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

    logger.info("Trying to request: %s" %
                fetch_format.format(**transifex_url_data))
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

    logger.info("Trying to request: %s" %
                fetch_format.format(**transifex_url_data))
    logger.info("With creds: %s %s" % (user, password))

    r = requests.get(fetch_format.format(
        **transifex_url_data), auth=(user, password))

    translation = r.json()

    translated_fields = json.loads(translation['content'])

    _translate_service(translated_fields, language, service)


def _translate_service(translation_dict, language, service):
    for k in translation_dict.keys():
        if hasattr(service, "{}_{}".format(k, language)):
            setattr(service, "{}_{}".format(k, language), translation_dict[k])
    location = None
    if (service.location != None):
        location = service.location.ewkt.split(";")[1]
    service.location = None
    service.save()
    cursor = connections['default'].cursor()        
    cursor.execute("update services_service set location = ST_GEOMFROMTEXT(%s,4326) where id = %s ;", [location, service.id])


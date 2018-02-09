import logging

from celery.task import task
from django.conf import settings

logger = logging.getLogger(__name__)


@task
def cache_uri(uri, language):
    from . import utils
    try:
        logger.info('Caching {} {}.'.format(uri, language))

        return utils.fetch_content(uri, language=language, clear=True)
    except:  # noqa
        logger.exception('Error running caching.', exc_info=True)


@task
def reload_cache():
    from .models import GeographicRegion, ImportantInformation
    try:
        for g in GeographicRegion.objects.all():
            for l in dict(settings.LANGUAGES).keys():
                logger.info('Caching {} {}.'.format(g.name, l.lower()))
                c = cache_uri(g.uri, l.lower())

                c = c['metadata']
                if 'page_title' in c:
                    logger.info('Setting {} as title for {}'.format(c['page_title'], l))
                    setattr(g, 'title_{}'.format(l), c['page_title'])
            g.save()

        for g in ImportantInformation.objects.all():
            for l in dict(settings.LANGUAGES).keys():
                logger.info('Caching {} {}.'.format(g.name, l.lower()))
                c = cache_uri(g.uri, l.lower())

                c = c['metadata']
                if 'page_title' in c:
                    logger.info('Setting {} as title for {}'.format(c['page_title'], l))
                    setattr(g, 'title_{}'.format(l), c['page_title'])
            g.save()

    except:  # noqa
        logger.exception('Error running caching.', exc_info=True)

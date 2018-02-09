import os
from celery import Celery
from django.conf import settings
from django.core.exceptions import ImproperlyConfigured

if 'DJANGO_SETTINGS_MODULE' not in os.environ:
    raise ImproperlyConfigured("Need to set DJANGO_SETTINGS_MODULE in environment "
                               "before starting celery")

app = Celery('service_info')

# Using a string here means the worker will not have to
# pickle the object when using Windows.
app.config_from_object('django.conf:settings')
app.autodiscover_tasks(lambda: settings.INSTALLED_APPS)


@app.task(bind=True)
def debug_task(self):
    print('Request: {0!r}'.format(self.request))

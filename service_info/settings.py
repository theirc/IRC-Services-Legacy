# Django settings for service_info project.
import os
import sys

from celery.schedules import crontab
from django.utils.translation import ugettext_lazy as _

# BASE_DIR = path/to/source/service_info
# E.g. this file is BASE_DIR/settings/base.py
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = BASE_DIR
WEBSERVER_ROOT = BASE_DIR

TEAM_EMAIL = 'reynaldo.rodrigues@rescue.org'
ADMINS = (
    ('Rey Rodrigues', TEAM_EMAIL),
)

SERVER_EMAIL = TEAM_EMAIL

EMAIL_HOST_USER = os.environ.get('EMAIL_HOST_USER', '')
EMAIL_HOST_PASSWORD = os.environ.get('EMAIL_HOST_PASSWORD', '')
EMAIL_HOST = os.environ.get('EMAIL_HOST', '')
EMAIL_USE_TLS = os.environ.get('EMAIL_USE_TLS', True)
EMAIL_PORT = os.environ.get('EMAIL_PORT', '587')

STAFF_EMAIL = os.environ.get('STAFF_EMAIL', '')

DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.spatialite',
        'NAME': os.path.join(BASE_DIR, 'db.sqlite3'),
    }
}

# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# On Unix systems, a value of None will cause Django to use the same
# timezone as the operating system.
# If running in a Windows environment this must be set to the same as your
# system time zone.
TIME_ZONE = 'UTC'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en'

# LANGUAGES is only used in the Django admin
LANGUAGES = [
    ('en', _('English')),
    ('ar', _('Arabic')),
    ('fa', _('Persian')),
    ('fr', _('French')),
    ('de', _('German')),
    ('el', _('Greek')),
    ('ur', _('Urdu')),
    ('es', _('Spanish')),
]

# LANGUAGES used in CMS app
LANGUAGES_CMS = LANGUAGES

# LANGUAGES used in Service translations
SERVICE_LANGUAGES = LANGUAGES

FRONTEND_LANGUAGES = LANGUAGES

PARLER_LANGUAGES = {
    'default': {
        'fallbacks': ['en'],  # defaults to PARLER_DEFAULT_LANGUAGE_CODE
        # the default; let .active_translations() return fallbacks too.
        'hide_untranslated': True,
    }
}
PARLER_SHOW_EXCLUDED_LANGUAGE_TABS = True

TRANSIFEX_USER = os.environ.get('TRANSIFEX_USER')
TRANSIFEX_PASSWORD = os.environ.get('TRANSIFEX_PASSWORD')
TRANSIFEX_PROJECT_SLUG = os.environ.get('TRANSIFEX_PROJECT_SLUG')
TRANSIFEX_SERVICES_PROJECT_SLUG = os.environ.get(
    'TRANSIFEX_SERVICES_PROJECT_SLUG')
TRANSIFEX_BLOG_PROJECT_SLUG = os.environ.get(
    'TRANSIFEX_BLOG_PROJECT_SLUG', 'refugeeinfo-blog-ghost')

TRANSIFEX_PROJECTS = {
    'refugeeinfo': filter(None, os.environ.get('TRANSIFEX_PROJECTS_ALL', '').split(',')),
    'refugee-info-irc': filter(None, os.environ.get('TRANSIFEX_PROJECTS_IRC', '').split(','))
}

# Map Django language codes to the equivalent language code needed for a third-party service
SERVICE_LANGUAGE_CODES = {
    'facebook': {
        'ar': 'ar_AR',
        'en': 'en_US',
        'fr': 'fr_FR',
    },
    'twitter': {
        'ar': 'ar',
        'en': 'en',
        'fr': 'fr',
    }
}

# Language names for CMS language picker; intentionally not translated
MENU_LANGUAGE_NAMES = {
    'ar': '&#x627;&#x644;&#x639;&#x631;&#x628;&#x64A;&#x629;',
    'en': 'English',
    'fr': 'Français',
}

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
# And that's what we want, otherwise we have no control.
USE_L10N = False

# Time display format:
TIME_FORMAT = 'G:i'  # 24-hour time without leading zero; minutes

# Time input format(s):
TIME_INPUT_FORMATS = ('%H:%M',)  # 24-hour time, with leading zero; minutes

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: '/home/media/media.lawrence.com/media/'
# MEDIA_ROOT = os.path.join(BASE_DIR, 'public', 'media')


# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' 'static/' subdirectories and in STATICFILES_DIRS.
# Example: '/home/media/media.lawrence.com/static/'
STATIC_ROOT = os.path.join(BASE_DIR, 'public', 'static')

# URL prefix for static files.
# Example: 'http://media.lawrence.com/static/'
STATIC_URL = '/public/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    os.path.join(BASE_DIR, 'service_info', 'static'),
    os.path.join(BASE_DIR, "node_modules"),
)

LOCALE_PATHS = (
    os.path.join(BASE_DIR, 'locale'),
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    # important! place right before django.contrib.staticfiles.finders.AppDirectoriesFinder
    'django.contrib.staticfiles.finders.AppDirectoriesFinder'
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = 'hfyyf*=)1!1m16vo$y=g8(r&po3(qvasinv&lv2i&%ztsg7y&a'

MIDDLEWARE_CLASSES = (
    'corsheaders.middleware.CorsMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'service_info.middleware.Restore404AfterLocaleMiddleware',
    'django.middleware.locale.LocaleMiddleware',
    'service_info.middleware.Hide404FromLocaleMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.auth.middleware.SessionAuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.contrib.sites.middleware.CurrentSiteMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'reversion.middleware.RevisionMiddleware',
    'debug_toolbar.middleware.DebugToolbarMiddleware'
)

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': (
            os.path.join(BASE_DIR, 'templates'),
            os.path.join(BASE_DIR, 'service_info', 'templates'),
        ),
        'OPTIONS': {
            'context_processors':
                (
                    'django.contrib.auth.context_processors.auth',
                    'django.template.context_processors.debug',
                    'django.template.context_processors.i18n',
                    'django.template.context_processors.media',
                    'django.template.context_processors.static',
                    'django.template.context_processors.tz',
                    'django.template.context_processors.csrf',
                    'django.template.context_processors.request',
                    'django.contrib.messages.context_processors.messages',
                    'django.template.context_processors.request'
                ),
            'loaders':
                (
                    'django.template.loaders.filesystem.Loader',
                    'django.template.loaders.app_directories.Loader'
                )
        }
    },
]

ROOT_URLCONF = 'service_info.urls'
API_URL = os.environ.get('API_URL', '')
WEB_CLIENT_URL = os.environ.get('WEB_CLIENT_URL', 'https://www.refugee.info/')

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'service_info.wsgi.application'

FIXTURE_DIRS = (
    os.path.join(BASE_DIR, 'fixtures'),
)

INSTALLED_APPS = (

    'django.contrib.contenttypes',
    'django.contrib.auth',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.humanize',
    'django.contrib.sitemaps',
    'django.contrib.sites',
    'django.contrib.gis',


    'email_user',
    'haystack',

    'regions',
    'services',

    'corsheaders',
    'mptt',
    'easy_thumbnails',

    'rest_framework',
    'rest_framework.authtoken',
    'rest_framework_gis',
    'parler',
    'reversion',
    # Load after easy_thumbnails so that its thumbnail template tag (unused
    # in this project) is hidden.
    'sorl.thumbnail',
    'push_notifications',
    'ckeditor',
    'ckeditor_uploader',
    'djng',

    'admin_panel',

    'services.templatetags.newsletter_extras',
    'debug_toolbar',
)

MIGRATION_MODULES = {
    'medialibrary': 'cms.migrate.medialibrary',
}

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
    },
    'formatters': {
        'basic': {
            'format': '%(asctime)s %(name)-20s %(levelname)-8s %(message)s',
        },
    },
    'handlers': {
        'console': {
            'level': 'DEBUG',
            'class': 'logging.StreamHandler',
            'formatter': 'basic'
        },
    },
    'root': {
        'handlers': ['console', ],
        'level': 'ERROR',
    },
    'loggers': {
        'django.request': {
            'handlers': ['console', ],
            'level': 'ERROR',
            'propagate': True,
        },
        'service_info': {
            'handlers': ['console', ],
            'level': 'INFO',
            'propagate': True,
        },
        'django.db.backends': {
            'level': 'ERROR',
            'handlers': ['console'],
            'propagate': True,
        },
    }
}

SITE_ID = 1


# Application settings
REST_FRAMEWORK = {
    'DEFAULT_FILTER_BACKENDS': [
        'rest_framework.filters.DjangoFilterBackend',
        'rest_framework.filters.SearchFilter',
        'rest_framework.filters.OrderingFilter',
    ],
    # Use Django's standard `django.contrib.auth` permissions
    # by default.  (We'll alter this as needed on a few specific
    # views.)
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissions'
    ],
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'api.auth.ServiceInfoTokenAuthentication',
        # Remove session auth for now, as it doesn't seem to be compatible with
        # token auth when both frontend and backend are on the same port
        # 'rest_framework.authentication.SessionAuthentication',
    ),
    # LimitOffsetPagination allows the caller to control pagination.
    # We won't paginate by default.
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.LimitOffsetPagination',
}

AUTH_USER_MODEL = 'email_user.EmailUser'

# Just use admin login view for now
LOGIN_URL = 'admin:login'

# How many days a new user has to activate their account
# by following the link in their new account email message.
ACCOUNT_ACTIVATION_DAYS = 3

# When someone successfully activates their user account,
# redirect them to this URL.
ACCOUNT_ACTIVATION_REDIRECT_URL = '/nosuchurl'

CORS_ORIGIN_ALLOW_ALL = True
CORS_ALLOW_HEADERS = (
    'x-requested-with',
    'content-type',
    'accept',
    'origin',
    'authorization',
    'x-csrftoken',
    'serviceinfoauthorization',
    'x-requested-location',
)

# If this changes here, also change the password fields'
# minlength attribute in frontend/templates/provider-form.hbs
MINIMUM_PASSWORD_LENGTH = 6

# Periodic celery tasks
CELERYBEAT_SCHEDULE = {
    "newsletter": {
        'task': 'services.tasks.service_confirmation_newsletter',
        'schedule': crontab(minute=str(os.environ.get('NEWSLETTER_SCHEDULE_MINUTE', '0')),
                            hour=str(os.environ.get('NEWSLETTER_SCHEDULE_HOUR', '*'))),
    },
}


HAYSTACK_CONNECTIONS = {
    'default': {
        'ENGINE': 'haystack.backends.whoosh_backend.WhooshEngine',
        'PATH': os.path.join(os.path.dirname(__file__), 'whoosh_index'),
    },
}

# JIRA settings
JIRA_SERVER = os.environ.get(
    'JIRA_SERVER', 'https://refugeeinfo.atlassian.net/')
JIRA_USER = os.environ.get('JIRA_USER', '')
JIRA_PASSWORD = os.environ.get('JIRA_PASSWORD', '')
JIRA_DUEIN_DAYS = 2

# Production JIRA projects:
JIRA_SERVICES_PROJECT_KEY = os.environ.get('JIRA_SERVICES_PROJECT_KEY', 'RIS')
JIRA_FEEDBACK_PROJECT_KEY = os.environ.get('JIRA_FEEDBACK_PROJECT_KEY', 'RIS')
JIRA_REQUEST_SERVICE_PROJECT_KEY = os.environ.get(
    'JIRA_REQUEST_SERVICE_PROJECT_KEY', 'RIS')

# Regex string that will only match valid phone numbers
# 12-123456
# ##-######
# Note: A few tests assume this regex; if you change it, re-run the
# tests and fix them.
PHONE_NUMBER_REGEX = r'^\d{2}-\d{6}$'

TEST_RUNNER = 'service_info.runner.CustomTestSuiteRunner'

# Use https when constructing links to ourselves?
# Generally True, we'll change to False in dev.py for running locally
SECURE_LINKS = True

# How many seconds to allow signed URLs to be valid
SIGNED_URL_LIFETIME = 300

# Google reCAPTCHA
CAPTCHA_SITEKEY = os.environ.get('CAPTCHA_SITEKEY', '')
CAPTCHA_SECRETKEY = os.environ.get('CAPTCHA_SECRETKEY', '')

if 'MEMCACHED_URL' in os.environ:
    from urllib.parse import urlparse

    memcached = urlparse(os.environ.get('MEMCACHED_URL'))

    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.memcached.MemcachedCache',
            'LOCATION': '{}:{}'.format(memcached.hostname, (memcached.port or 11211)),
        }
    }

CMS_ENVIRONMENT = os.environ.get('CMS_ENVIRONMENT', '')
CMS_URL = os.environ.get('CMS_URL', '')
CMS_USER = os.environ.get('CMS_USER', '')
CMS_PASSWORD = os.environ.get('CMS_PASSWORD', '')

if sys.platform == 'darwin':
    SPATIALITE_LIBRARY_PATH = os.environ.get(
        'SPATIALITE_LIBRARY_PATH',
        '/usr/local/lib/mod_spatialite.dylib'
    )


if 'GEOS_LIBRARY_PATH' in os.environ:
    GEOS_LIBRARY_PATH = os.environ.get('GEOS_LIBRARY_PATH')
if 'GDAL_LIBRARY_PATH' in os.environ:
    GDAL_LIBRARY_PATH = os.environ.get('GDAL_LIBRARY_PATH')

# Parse database configuration from $DATABASE_URL
import dj_database_url

if 'DATABASE_URL' in os.environ:
    DATABASES['default'] = dj_database_url.config()

ALLOWED_HOSTS = ['*']
DEBUG = str(os.environ.get('DEBUG', 'False')).lower() == 'true'
TEMPLATE_DEBUG = DEBUG
EMAIL_SUBJECT_PREFIX = '[RefugeeInfo] '
DEFAULT_FROM_EMAIL = os.environ.get('DEFAULT_FROM_EMAIL', 'noreply@rescue.org')

SESSION_COOKIE_SECURE = False
SESSION_COOKIE_HTTPONLY = False


if 'test' in sys.argv:
    CELERYBEAT_SCHEDULE = {}
    CELERY_ALWAYS_EAGER = True
    SOUTH_TESTS_MIGRATE = True

"""
AWS Storage Section
"""
DEFAULT_FILE_STORAGE = 'storages.backends.s3boto.S3BotoStorage'

CKEDITOR_UPLOAD_PATH = "media/"
CKEDITOR_IMAGE_BACKEND = 'pillow'

AWS_QUERYSTRING_AUTH = False
AWS_ACCESS_KEY_ID = os.environ.get('AWS_ACCESS_KEY_ID', None)
AWS_SECRET_ACCESS_KEY = os.environ.get('AWS_SECRET_ACCESS_KEY', None)
AWS_STORAGE_BUCKET_NAME = os.environ.get('AWS_STORAGE_BUCKET_NAME', None)

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: 'http://media.lawrence.com/media/', 'http://example.com/media/'

"""ADD TO local_settings.py if AWS settings are there"""
MEDIA_URL = 'https://%s.s3.amazonaws.com:443/' % AWS_STORAGE_BUCKET_NAME

MAX_UPLOAD_SIZE = 1024 * 1024 * 1


BROKER_URL = CELERY_BROKER_URL = os.environ.get(
    'CELERY_BROKER_URL', os.environ.get('REDIS_URL', ''))
RESULT_BACKEND = CELERY_RESULT_BACKEND = os.environ.get(
    'CELERY_BROKER_URL', os.environ.get('REDIS_URL', ''))


"""
Service Confirmation Newsletter
"""
NEWSLETTER_ENABLED = str(os.environ.get(
    'NEWSLETTER_ENABLED', 'False')).lower() == 'true'
NEWSLETTER_TEST = str(os.environ.get(
    'NEWSLETTER_TEST', 'False')).lower() == 'true'
CONFIRM_TIME = os.environ.get('CONFIRM_TIME', 90)
REMINDER_TIME = os.environ.get('REMINDER_TIME', 14)

"""
Newsletter sending email
"""
NEWSLETTER_FROM_EMAIL = os.environ.get('NEWSLETTER_FROM_EMAIL', '')
NEWSLETTER_FROM_EMAIL_HOST = os.environ.get('NEWSLETTER_FROM_EMAIL_HOST', '')
NEWSLETTER_FROM_EMAIL_HOST_USER = os.environ.get(
    'NEWSLETTER_FROM_EMAIL_HOST_USER', '')
NEWSLETTER_FROM_EMAIL_HOST_PASSWORD = os.environ.get(
    'NEWSLETTER_FROM_EMAIL_HOST_PASSWORD', '')
NEWSLETTER_FROM_EMAIL_PORT = os.environ.get('NEWSLETTER_FROM_EMAIL_PORT', '')
NEWSLETTER_FROM_EMAIL_USE_TLS = os.environ.get(
    'NEWSLETTER_FROM_EMAIL_USE_TLS', '')

"""
Newletter reports
"""
SERVICE_MANAGER_EMAIL = os.environ.get(
    'SERVICE_MANAGER_EMAIL', 'servicemap@refugee.info')
REMINDER_UNCONFIRMED_REPORT_TIME = os.environ.get(
    'REMINDER_UNCONFIRMED_REPORT_TIME', 7)


GHOST_USER_NAME = os.environ.get('GHOST_USER_NAME')
GHOST_PASSWORD = os.environ.get('GHOST_PASSWORD')
GHOST_TAG_MAP = dict([k.split(':') for k in os.environ.get(
    'GHOST_TAG_MAP', 'ur:urdu;fa:farsi;ar:arabic;fr:french').split(';')])

INTERNAL_IPS = [
]

try:
    from .local_settings import *
except ImportError:
    pass

DEBUG = True
DATABASES = {
    'default': {
        'ENGINE': 'django.contrib.gis.db.backends.postgis',
        'NAME': 'service_info',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'localhost',
        'PORT': '5432',
    }
}

TRANSIFEX_USER = ''
TRANSIFEX_PASSWORD = ''
TRANSIFEX_PROJECT_SLUG = ''

AWS_ACCESS_KEY_ID = ''
AWS_SECRET_ACCESS_KEY = ''
AWS_STORAGE_BUCKET_NAME = ''

EMAIL_HOST_USER = ''
EMAIL_HOST_PASSWORD = ''
EMAIL_HOST = ''
EMAIL_USE_TLS = True
EMAIL_PORT = 587

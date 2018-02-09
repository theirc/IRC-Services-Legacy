sh pre_deploy.sh; \
python manage.py collectstatic --noinput; \
newrelic-admin run-program gunicorn service_info.wsgi --timeout 180 --log-file -

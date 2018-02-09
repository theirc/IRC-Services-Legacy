sh pre_deploy.sh; \
celery -B -A service_info worker -l debug

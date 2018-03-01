#!/bin/bash
service ssh start
service nginx reload
service nginx start
gunicorn  -b 0.0.0.0:8888 -w 4 service_info.wsgi:application

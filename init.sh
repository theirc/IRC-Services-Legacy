#!/bin/bash
service ssh start
gunicorn  -b 0.0.0.0:8000 -w 4 service_info.wsgi:application

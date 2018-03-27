#!/bin/bash
service ssh start
service nginx reload
service nginx start
service cron reload
service cron restart
export > cron.sh
cat _cron.sh >> cron.sh
chmod +x cron.sh
gunicorn  -b 0.0.0.0:8888 -w 4 service_info.wsgi:application


FROM node:carbon

RUN mkdir /code
WORKDIR /code

ADD package.json /code/
ADD Gulpfile.js /code/
RUN npm install
RUN npm install gulp
RUN npm install -g gulp
RUN gulp

FROM python:3.6

RUN mkdir /code
WORKDIR /code
ADD requirements.txt /code/
ADD apt-packages /code/
RUN pip install -r requirements.txt

# ssh
ENV SSH_PASSWD "root:Docker!"
RUN apt-get update \
        && apt-get update \
        && apt-get  install -y  `cat /code/apt-packages`

ADD . /code/

RUN python manage.py collectstatic --noinput
RUN python manage.py migrate --noinput

EXPOSE 8000 2222

ENV DJANGO_SETTINGS_MODULE service_info.settings
CMD ["gunicorn", "-b 0.0.0.0:8000", "-w 4", "service_info.wsgi:application"]
#ENTRYPOINT ["init.sh"]
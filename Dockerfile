
FROM python:3.6

RUN mkdir /code
WORKDIR /code

ADD requirements.txt /code/
ADD apt-packages /code/
ADD nginx.conf /code/
ADD package.json /code/
ADD Gulpfile.js /code/
#ADD cron.sh /code/

RUN pip install -r requirements.txt
ENV SSH_PASSWD "root:Docker!"

RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
#RUN apt-get install -y software-properties-common python-software-properties --fix-broken --fix-missing
#RUN add-apt-repository ppa:maxmind/ppa
RUN apt-get update 
#RUN apt-get install -y  `cat /code/apt-packages`

#RUN apt-get install -y --allow-unauthenticated libicu52
RUN apt-get install -y --allow-unauthenticated libicu-dev 
RUN apt-get install -y --allow-unauthenticated libgeoip1 
RUN apt-get install -y --allow-unauthenticated build-essential 
RUN apt-get install -y --allow-unauthenticated python3-dev 
RUN apt-get install -y --allow-unauthenticated python3-setuptools 
RUN apt-get install -y --allow-unauthenticated python3-numpy 
RUN apt-get install -y --allow-unauthenticated python3-scipy 
RUN apt-get install -y --allow-unauthenticated libatlas-dev 
RUN apt-get install -y --allow-unauthenticated binutils 
RUN apt-get install -y --allow-unauthenticated libproj-dev 
RUN apt-get install -y --allow-unauthenticated gdal-bin 
#RUN apt-get install -y --allow-unauthenticated libatlas3gf-base 
RUN apt-get install -y --allow-unauthenticated libffi-dev 
RUN apt-get install -y --allow-unauthenticated wkhtmltopdf 
RUN apt-get install -y --allow-unauthenticated libspatialite-dev 
RUN apt-get install -y --allow-unauthenticated spatialite-bin nginx

RUN apt-get install -y nodejs
#RUN apt-get install libmaxminddb0 libmaxminddb-dev mmdb-bin
# ssh
RUN apt-get install -y --no-install-recommends dialog cron \
        && apt-get install -y --no-install-recommends openssh-server \
        && echo "$SSH_PASSWD" | chpasswd 
ADD commands-cron /etc/crontab

RUN chmod 0644 /etc/crontab  
RUN touch /var/log/cron.log 
ADD . /code/

RUN npm install
RUN npm install gulp
RUN npm install angular-material@1.1.7
RUN npm install -g gulp
RUN npm rebuild node-sass --force
RUN gulp

RUN python manage.py collectstatic --noinput
#RUN python manage.py migrate --noinput


COPY sshd_config /etc/ssh/
COPY nginx.conf /etc/nginx/sites-enabled/site.conf
COPY nginx.conf /etc/nginx/sites-available/site.conf

EXPOSE 8000 2222

ENV DJANGO_SETTINGS_MODULE service_info.settings

RUN chmod 755 /code/init.sh
ENTRYPOINT ["/code/init.sh"]

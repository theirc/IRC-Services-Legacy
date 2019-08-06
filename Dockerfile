
FROM python:3.6

RUN mkdir /code
WORKDIR /code

# Chain these commands - each one on a line creates a layer in the final Docker image
#Changing ADD to COPY - No specialized source needed(E.g. URL/TAR archive)
COPY requirements.txt apt-packages nginx.conf package.json Gulpfile.js /code/

#ADD cron.sh /code/

RUN pip install -r requirements.txt

# This needs to be uopdated if you are going to use SSH.  Its the default in th Azure Docs
ENV SSH_PASSWD "root:Docker!"


#RUN apt-get install -y software-properties-common python-software-properties --fix-broken --fix-missing
#RUN add-apt-repository ppa:maxmind/ppa
# RUN apt-get update 
#RUN apt-get install -y  `cat /code/apt-packages`

# Chain these commands - each one on a line creates a layer in the final Docker image
#RUN apt-get install -y --allow-unauthenticated libicu52
#RUN apt-get clean && apt-get update -y 
#RUN apt-get install -y --allow-unauthenticated libicu-de \

RUN apt-get clean && apt-get update && apt-get install -y --allow-unauthenticated libicu-dev \
    && apt-get install -y --allow-unauthenticated libgeoip1 \
    && apt-get install -y --allow-unauthenticated build-essential \
    && apt-get install -y --allow-unauthenticated python3-dev \
    && apt-get install -y --allow-unauthenticated python3-setuptools \
    && apt-get install -y --allow-unauthenticated python3-numpy \
    && apt-get install -y --allow-unauthenticated python3-scipy \
    && apt-get install -y --allow-unauthenticated libatlas-dev \
    && apt-get install -y --allow-unauthenticated binutils \
    && apt-get install -y --allow-unauthenticated libproj-dev \
    && apt-get install -y --allow-unauthenticated gdal-bin \
    && apt-get install -y --allow-unauthenticated libffi-dev \
    && apt-get install -y --allow-unauthenticated wkhtmltopdf \
    && apt-get install -y --allow-unauthenticated libspatialite-dev \
    && apt-get install -y --allow-unauthenticated spatialite-bin nginx

RUN curl -sL https://deb.nodesource.com/setup_9.x | bash - && apt-get install -y nodejs
#RUN apt-get install libmaxminddb0 libmaxminddb-dev mmdb-bin
# ssh
RUN apt-get install -y --no-install-recommends dialog cron \
        && apt-get install -y --no-install-recommends openssh-server \
        && echo "$SSH_PASSWD" | chpasswd 
ADD commands-cron /etc/crontab

RUN chmod 0644 /etc/crontab && touch /var/log/cron.log 
ADD . /code/

RUN npm install && npm install gulp && npm install angular-material@1.1.7 \
    && npm install -g gulp && npm rebuild node-sass --force \
    && gulp && python manage.py collectstatic --noinput
#RUN python manage.py migrate --noinput

WORKDIR /frontend
RUN npm install 

WORKDIR /code
RUN gulp && python manage.py collectstatic --noinput


COPY sshd_config /etc/ssh/
COPY nginx.conf /etc/nginx/sites-enabled/site.conf
COPY nginx.conf /etc/nginx/sites-available/site.conf

EXPOSE 8000 2222

ENV DJANGO_SETTINGS_MODULE service_info.settings

RUN chmod 755 /code/init.sh
ENTRYPOINT ["/code/init.sh"]

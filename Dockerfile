
FROM python:3.6

RUN mkdir /code
WORKDIR /code

ADD requirements.txt /code/
ADD apt-packages /code/
ADD nginx.conf /code/
ADD package.json /code/
ADD Gulpfile.js /code/

RUN pip install -r requirements.txt
ENV SSH_PASSWD "root:Docker!"

RUN curl -sL https://deb.nodesource.com/setup_9.x | bash -
RUN apt-get install -y software-properties-common python-software-properties --fix-missing
#RUN add-apt-repository ppa:maxmind/ppa
RUN apt-get update 
RUN apt-get install -y  `cat /code/apt-packages`
RUN apt-get install -y nodejs
#RUN apt-get install libmaxminddb0 libmaxminddb-dev mmdb-bin
# ssh
RUN apt-get install -y --no-install-recommends dialog \
        && apt-get install -y --no-install-recommends openssh-server \
        && echo "$SSH_PASSWD" | chpasswd 

ADD . /code/

RUN npm install
RUN npm install gulp
RUN npm install -g gulp
RUN npm rebuild node-sass --force
RUN gulp

RUN python manage.py collectstatic --noinput
#RUN python manage.py migrate --noinput

RUN mkdir /code/geo_db
RUN curl http://geolite.maxmind.com/download/geoip/database/GeoLite2-City.tar.gz > /code/geo_db/city.tar.gz
RUN curl http://geolite.maxmind.com/download/geoip/database/GeoLite2-Country.tar.gz > /code/geo_db/country.tar.gz
RUN tar xvzf /code/geo_db/city.tar.gz
RUN tar xvzf /code/geo_db/country.tar.gz

RUN mv /code/geo_db/GeoLite2-City_*/*.mmdb /code/geo_db/
RUN mv /code/geo_db/GeoLite2-Country_*/*.mmdb /code/geo_db/


COPY sshd_config /etc/ssh/
COPY nginx.conf /etc/nginx/sites-enabled/site.conf
COPY nginx.conf /etc/nginx/sites-available/site.conf

EXPOSE 8000 2222

ENV DJANGO_SETTINGS_MODULE service_info.settings

RUN chmod 755 /code/init.sh
ENTRYPOINT ["/code/init.sh"]

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
RUN python manage.py migrate

EXPOSE 8000 2222
CMD ["python", "/code/manage.py", "runserver", "0.0.0.0:8000"]
#ENTRYPOINT ["init.sh"]
Installing
----------

### Dependencies
+ Python 3.5
+ pip
+ PostgreSQL
+ PostGIS 

### Installing dependencies
    sudo add-apt-repository ppa:fkrull/deadsnakes
    sudo apt-get update
    sudo apt-get install python3.5 python3.5-dev python3-pip
    sudo apt-get install postgresql postgresql-server-dev-9.3 postgresql-9.3-postgis-2.1
    sudo apt-get install libmysqlclient-dev ruby
    sudo gem install sass

### Create database
    createdb -h localhost -U postgres service_info

### Setting up a virtualenv
    Virtualenv is not required (but it's better to use it)
    sudo pip3 install virtualenv
    mkdir ~/.virtualenvs/
    virtualenv ~/.virtualenvs/api.refugee.info -p <path>/python3.5

### Configuring App
    source ~/.virtualenvs/api.refugee.info/bin/activate      # if you installed
    pip install -r requirements.txt
    npm install
    cp service_info/local_settings.example.py service_info/local_settings.py

### Building App
    gulp
    

### Setting up your django environment
    ./manage.py migrate
    ./manage.py createsuperuser
    ./manage.py runserver
    ./manage.py createinitialrevisions  # create existing models history

### Code style
    source ~/.virtualenvs/api.refugee.info/bin/activate      # if you installed
    pip install flake8
    git diff origin/master | flake8 --diff

### Setting environment for tests
    wget -N http://chromedriver.storage.googleapis.com/2.24/chromedriver_linux64.zip -P ~/Downloads
    unzip ~/Downloads/chromedriver_linux64.zip -d ~/Downloads
    sudo mv -f ~/Downloads/chromedriver /usr/local/share/chromedriver
    sudo ln -s /usr/local/share/chromedriver /usr/local/bin/chromedriver
    sudo ln -s /usr/local/share/chromedriver /usr/bin/chromedriver

### Running tests
    ./manage.py test --liveserver=localhost:8000


### Running Celery

##### Set environment variable DJANGO_SETTINGS_MODULE pointing to service_info.settings:
    export DJANGO_SETTINGS_MODULE="service_info.settings"
##### From project directory (with virtual environment activated) run:
    ~/.virtualenvs/api.refugee.info/bin/celery -A service_info worker -l info -E -B --purge

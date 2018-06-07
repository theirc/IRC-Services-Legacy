import hashlib
import json
import logging
import random
from datetime import datetime, timedelta

import requests
import six
from django.conf import settings
from django.contrib.sites.models import Site
from django.core.mail import get_connection, send_mail
from django.db.models import Q
from haystack.management.commands import update_index
from celery.task import task

from services.utils import get_service_data_from_clinic
from . import jira_support


logger = logging.getLogger(__name__)


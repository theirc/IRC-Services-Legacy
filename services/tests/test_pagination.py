import json
from http.client import OK
from unittest import skip

from django.test import TestCase

from services.models import Service
from services.tests.factories import ServiceFactory
from services.tests.test_api import APITestMixin


class PaginationTest(APITestMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.url = '/v1/services/search/'

    @skip
    def test_services_pagination(self):
        # Services results are paginated by default
        for x in range(10):
            ServiceFactory(status=Service.STATUS_CURRENT)
        rsp = self.client.get(self.url + "?page_size=5")  # not authed
        self.assertEqual(OK, rsp.status_code, msg=rsp.content.decode('utf-8'))
        response = json.loads(rsp.content.decode('utf-8'))
        records_returned = response['results']
        self.assertEqual(5, len(records_returned))

import json

from django.test import TestCase

from regions.models import GeographicRegion
from services.models import Service
from services.tests.factories import ServiceFactory
from services.tests.test_api import APITestMixin


class ServiceFilteringAPITest(APITestMixin, TestCase):

    def test_filter_with_parents(self):
        # given
        romania = GeographicRegion.objects.get(slug='romania')
        self.assertIsNotNone(romania)
        bucharest = GeographicRegion.objects.get(slug='bucharest')
        self.assertIsNotNone(bucharest)
        ServiceFactory(region=romania, status='current')
        ServiceFactory(region=bucharest, status='current')
        self.assertEqual(Service.objects.all().count(), 2)

        # when
        services_romania = self.api_client.get(
            '/v2/services/search/?filter=with-parents&geographic_region=' +
            romania.slug + '&page=1&page_size=100')
        self.assertEqual(services_romania.status_code, 200)
        services_bucharest = self.api_client.get(
            '/v2/services/search/?filter=with-parents&geographic_region=' +
            bucharest.slug + '&page=1&page_size=100')
        self.assertEqual(services_bucharest.status_code, 200)

        # then
        services_romania_content = json.loads(services_romania.content.decode('utf-8'))['results']
        self.assertEqual(len(services_romania_content), 1)
        services_bucharest_content = json.loads(services_bucharest.content.decode('utf-8'))['results']
        self.assertEqual(len(services_bucharest_content), 2)

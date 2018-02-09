import json
from http.client import OK

from django.conf import settings
from django.core.files.storage import default_storage
from django.core.urlresolvers import reverse
from django.test import TestCase

from email_user.tests.factories import EmailUserFactory
from regions.models import GeographicRegion
from services.models import ServiceType
from services.tests.factories import ServiceTypeFactory, ServiceFactory
from services.tests.test_api import APITestMixin

from rest_framework.authtoken.models import Token


class ServiceTypeAPITest(APITestMixin, TestCase):

    def test_get_types(self):
        rsp = self.client.get(reverse('servicetype-list'))
        self.assertEqual(OK, rsp.status_code)
        results = json.loads(rsp.content.decode('utf-8'))
        result = results[0]
        self.assertIn('vector_icon', result)
        vector_icon = result['vector_icon']
        self.assertTrue(vector_icon.startswith('fa '))

    def test_get_type(self):
        # Try it unauthenticated
        a_type = ServiceType.objects.first()
        url = a_type.get_api_url()
        rsp = self.client.get(url)
        self.assertEqual(OK, rsp.status_code)
        result = json.loads(rsp.content.decode('utf-8'))
        self.assertIn('vector_icon', result)
        vector_icon = result['vector_icon']
        self.assertTrue(vector_icon.startswith('fa '))

    def test_ordering(self):
        # given
        user = EmailUserFactory(is_staff=True, is_superuser=True, is_active=True)
        token, created = Token.objects.get_or_create(user=user)
        service_type = ServiceType.objects.first()

        types_ordering = self.api_client.get('/v2/servicetypes/')
        self.assertEqual(types_ordering.status_code, 200)
        types_ordering = json.loads(types_ordering.content.decode('utf-8'))

        service_type = self.api_client.get('/v2/servicetypes/' + str(service_type.id) + '/')
        self.assertEqual(service_type.status_code, 200)
        service_type = json.loads(service_type.content.decode('utf-8'))

        # when
        types_ordering = sorted(types_ordering, key=lambda k: k['name'])
        service_type['comments_en'] = 'test'
        service_type['types_ordering'] = types_ordering
        type_post = self.api_client.put(
            path='/v2/servicetypes/' + str(service_type['id']) + '/',
            data=service_type,
            HTTP_SERVICEINFOAUTHORIZATION="Token %s" % token.key,
            format='json')
        self.assertEqual(type_post.status_code, 200)

        # then
        types = ServiceType.objects.all().order_by('number')
        self.assertEqual(types_ordering[0]['name'], types[0].name)

    def test_used_types(self):
        # given
        bucharest = GeographicRegion.objects.get(slug='bucharest')
        romania = GeographicRegion.objects.get(slug='romania')
        service_type = ServiceType.objects.first()
        service = ServiceFactory(region=bucharest, status='current')
        service.types.add(service_type)
        service.save()

        # when
        get_used_types_bucharest = self.api_client.get(
            path='/v2/custom-servicetypes/used_types/?geographic_region=' + bucharest.slug,
            format='json')
        self.assertEqual(get_used_types_bucharest.status_code, 200)
        get_used_types_romania = self.api_client.get(
            path='/v2/custom-servicetypes/used_types/?geographic_region=' + romania.slug,
            format='json')
        self.assertEqual(get_used_types_romania.status_code, 200)

        # then
        used_types_bucharest = json.loads(get_used_types_bucharest.content.decode('utf-8'))
        self.assertEqual(len(used_types_bucharest), 1)
        used_types_romania = json.loads(get_used_types_romania.content.decode('utf-8'))
        self.assertEqual(len(used_types_romania), 1)

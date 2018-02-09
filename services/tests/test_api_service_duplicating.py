from django.test import TestCase

from email_user.tests.factories import EmailUserFactory
from regions.models import GeographicRegion
from services.models import Service
from services.tests.factories import ServiceFactory
from services.tests.test_api import APITestMixin

from rest_framework.authtoken.models import Token


class ServiceFilteringAPITest(APITestMixin, TestCase):

    def test_duplicating_services(self):
        # given
        user = EmailUserFactory(is_staff=True, is_superuser=True, is_active=True)
        token, created = Token.objects.get_or_create(user=user)

        romania = GeographicRegion.objects.get(slug='romania')
        self.assertIsNotNone(romania)
        ServiceFactory(region=romania, status='current')
        existing_service = Service.objects.all()
        self.assertEqual(len(existing_service), 1)

        # when
        duplicate_post = self.api_client.post(
            path='/v2/services/' + str(existing_service[0].id) + '/duplicate/?new_name=Test123',
            HTTP_SERVICEINFOAUTHORIZATION="Token %s" % token.key,
            format='json')
        self.assertEqual(duplicate_post.status_code, 201)

        # then
        duplicated_service = Service.objects.filter(name_en='Test123')
        self.assertEqual(Service.objects.all().count(), 2)
        self.assertEqual(len(duplicated_service), 1)
        self.assertNotEqual(existing_service[0].slug, duplicated_service[0].slug)

import io

import logging
import requests
from PIL import Image
from django.core.exceptions import ValidationError
from django.core.files.base import ContentFile
from django.core.management import BaseCommand
from django.db.transaction import atomic

from regions.models import GeographicRegion
from services.models import ProviderType, ServiceType, Provider, Service, ServiceArea

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    url = 'https://serviceinfo.rescue.org'

    headers = {
        'content-type': 'application/json',
        'ServiceInfoAuthorization': 'token 50d6a01c63cf8c3ee74017b154a19590c9174c9f'
    }

    def handle(self, *args, **options):
        services = requests.get('{}/api/services/search/'.format(self.url), headers=self.headers).json()
        print("Importing", len(services), "services.")
        try:
            ServiceArea.objects.get_or_create(
                name_en='Lebanon',
                geographic_region=GeographicRegion.objects.get(name='Lebanon')
            )
        except ValidationError:
            logger.error('There is no Lebanon in database')
            exit()

        for service in services:
            try:
                self.add_to_db(service)
            except Exception as ex:
                logger.error(ex)

        print("Done")

    def add_to_db(self, fetched_service):
        with atomic():
            if 'provider_fetch_url' in fetched_service:
                fetched_provider = requests.get('{}/{}'.format(self.url, fetched_service['provider_fetch_url']),
                                                headers=self.headers).json()
                fetched_provider['focal_point_name_en'] = \
                    fetched_provider.get('focal_point_name_en') or fetched_provider.get('name_en')

                provider_type = self.get_or_create_provider_type(fetched_provider)
                provider = self.get_or_create_provider(fetched_provider, provider_type)
                service_type = self.get_or_create_service_type(fetched_service)
                image_data = fetched_service.pop('image_data')
                service = self.get_or_create_service(fetched_service, service_type, provider)
                if image_data:
                    self.set_photo(service, image_data)

    @staticmethod
    def get_or_create_provider(fetched_provider, provider_type):
        r = requests.get("{}fetch/".format(fetched_provider['url'])).json()
        providers = Provider.objects.filter(name_en=r['name_en'])
        if providers:
            provider = providers[0]
        else:
            provider = Provider.objects.create(
                name_en=r['name_en'],
                name_ar=r.get('name_ar', ''),
                name_fr=r.get('name_fr', ''),
                description_en=r.get('description_en', ''),
                description_ar=r.get('description_ar', ''),
                description_fa=r.get('description_fr', ''),
                focal_point_name_en=r.get('focal_point_name_en', ''),
                focal_point_name_ar=r.get('focal_point_name_ar', ''),
                focal_point_name_fa=r.get('focal_point_name_fr', ''),
                address_en=r.get('address_en', ''),
                address_ar=r.get('address_ar', ''),
                address_fa=r.get('address_fr', ''),
                phone_number=r.get('phone_number', ''),
                contact_name=r.get('contact_name',''),
                title=r.get('title',''),
                website=r.get('website', ''),
                focal_point_phone_number=r.get('focal_point_phone_number', ''),
                type=provider_type
            )
        return provider

    def get_or_create_provider_type(self, fetched_provider):
        r = requests.get("{}".format(fetched_provider['type']), headers=self.headers).json()
        provider_types = ProviderType.objects.filter(name_en=r['name_en'])
        if provider_types:
            provider_type = provider_types[0]
        else:
            provider_type = ProviderType.objects.create(
                name_en=r['name_en'],
                name_ar=r['name_ar'],
                name_fr=r['name_fr'],
                number=ProviderType.objects.all().order_by('-number')[0].number + 1
            )
        return provider_type

    def get_or_create_service_type(self, fetched_service):
        r = requests.get("{}".format(fetched_service['type']), headers=self.headers).json()
        service_types = ServiceType.objects.filter(name_en=r['name_en'])
        if service_types:
            service_type = service_types[0]
        else:
            service_type = ServiceType.objects.create(
                name_en=r['name_en'],
                name_ar=r['name_ar'],
                name_fr=r['name_fr'],
                comments_en=r['comments_en'],
                comments_ar=r['comments_ar'],
                comments_fr=r['comments_fr'],
                number=ServiceType.objects.all().order_by('-number')[0].number + 1
            )
        return service_type

    @staticmethod
    def get_or_create_service(fetched_service, service_type, provider):
        services = Service.objects.filter(name_en=fetched_service['name_en'], provider=provider)
        if services:
            service = services[0]
        else:
            fetched_service.pop('id')
            fetched_service.pop('url')
            fetched_service.pop('type')
            fetched_service.pop('provider_fetch_url')
            fetched_service.pop('provider')
            fetched_service.pop('region')
            fetched_service.pop('selection_criteria')
            fetched_service.pop('distance')
            service = Service.objects.create(
                region=GeographicRegion.objects.get(slug='lebanon'),
                type=service_type,
                provider=provider,
                status=Service.STATUS_CURRENT,
                **fetched_service
            )
        return service

    def set_photo(self, service, image_data):
        image_request_result = requests.get(self.url + image_data['large_url'])
        image = Image.open(io.BytesIO(image_request_result.content))
        image_io = io.BytesIO()
        image.save(image_io, format='JPEG', optimize=True, quality=70)
        service.image.save(service.name_en, ContentFile(image_io.getvalue()))

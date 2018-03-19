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
    def handle(self, *args, **options):
        for provider in Provider.objects.all():
            regions = provider.services.values_list('region__id').distinct()
            if regions.count() == 1:
                region_id, = regions.first()
                region = GeographicRegion.objects.get(id=region_id)
                while region.level != 1:
                    region = region.parent
                provider.region = region
                print ("Assigning {} to {}".format(
                    region.name, provider.name_en))
                provider.save()

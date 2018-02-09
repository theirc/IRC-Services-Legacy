# Make sure our GEO data is loaded
from django.test import TestCase
from services.models import ServiceArea
from regions.models import GeographicRegion


class GeoTestCase(TestCase):
    def setUp(self):
        from .set_up import create_mock_data
        create_mock_data()

    def test_we_have_regions(self):
        self.assertTrue(GeographicRegion.objects.all().exists())

    def test_level_two_regions_have_parents(self):
        self.assertFalse(GeographicRegion.objects.filter(level=2, parent=None).exists())

    def test_service_areas_have_regions(self):
        self.assertFalse(ServiceArea.objects.filter(geographic_region=False).exists())

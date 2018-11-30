import logging

import dateutil.parser
import django_filters
import regions.models
from django.conf import settings
from django.contrib.gis.geos import Point
from django.db.models.query_utils import Q

from regions.models import GeographicRegion
from services.models import NewsletterEmailTemplate, Service

logger = logging.getLogger(__name__)


class ServiceTypeNumbersFilter(django_filters.CharFilter):
    """
    Filter service records where their service type has any of the
    numbers given in a comma-separated string.
    """

    def filter(self, qset, value):
        if not len(value):
            return qset
        return qset.filter(types__in=[int(s) for s in value.split(',')])


class CharAnyLanguageFilter(django_filters.CharFilter):
    """
    Given the base name of a field that has multiple language versions,
    filter allowing for any of the language versions to contain the
    given value, case-insensitively.

    E.g. if field_name is 'name' and the value given in the query is 'foo',
    then any record where 'name_en', 'name_ar', or 'name_fr' contains 'foo'
    will match.
    """

    def __init__(self, field_name):
        self.field_name = field_name
        super().__init__()

    def filter(self, qset, value):
        if not len(value):
            return qset
        query = Q()
        for lang in [lang_code for lang_code, lang_name in settings.LANGUAGES]:
            query |= Q(**{'%s_%s__icontains' % (self.field_name, lang): value})
        return qset.filter(query)


class SortByDistanceFilter(django_filters.CharFilter):
    """Order the results by their distance from a specified lat,long"""

    def filter(self, qset, value):
        if not len(value):
            return qset
        try:
            lat, long = [float(x) for x in value.split(',', 1)]
        except ValueError:
            return qset
        search_point = Point(long, lat)
        return qset.distance(search_point).order_by('distance')

        # We take the coords as lat, long because that's most common
        # (NS position, then EW).  But Point takes (x, y) which means
        # (long, lat) because x is distance east or west, or longitude,
        # and y is distance north or south, or latitude.


class DateGreaterThanFilter(django_filters.CharFilter):
    def filter(self, qs, value):
        if value:
            date = dateutil.parser.parse(value)
            l = {"{}__{}".format(self.name, 'gte'): date}
            return qs.filter(**l)

        return qs


class DateLowerThanFilter(django_filters.CharFilter):
    def filter(self, qs, value):
        if value:
            date = dateutil.parser.parse(value)
            l = {"{}__{}".format(self.name, 'lte'): date}
            return qs.filter(**l)

        return qs


class RegionFilter(django_filters.CharFilter):
    """
    Show all results from the region and children that intersects region geographic envelope
    """

    def filter(self, qs, value):
        if value:
            regs = regions.models.GeographicRegion.objects.filter(slug=value)
            if regs:
                reg = regs[0]
                qs = qs.filter(location__intersects=reg.geom.envelope)
        return qs


class CustomRegionFilter(django_filters.CharFilter):
    """
    Show all results from all levels related to level 1 region
    """

    def filter(self, qs, value):
        if value:
            regs = regions.models.GeographicRegion.objects.filter(slug=value)
            if regs:
                reg = regs[0]
                # if reg.level == 1:
                qs = qs.filter(Q(region=reg) | Q(region__parent=reg)
                               | Q(region__parent__parent=reg))
        return qs


class RelativesRegionFilter(django_filters.CharFilter):
    """
    Show all results from all parents and children for selected region
    """

    def filter(self, qs, value):
        if value:
            regs = regions.models.GeographicRegion.objects.filter(slug=value)
            if regs:
                reg = regs[0]
                qs = qs.filter(Q(region=reg) | Q(region__parent=reg)
                               | Q(region__parent__parent=reg))
                if reg.parent:
                    qs = qs.filter(Q(region=reg.parent))
                    if reg.parent.parent:
                        qs = qs.filter(Q(region=reg.parent.parent))
        return qs


class WithParentsRegionFilter(django_filters.CharFilter):
    """
    Show all results for selected region with its parents only
    """

    def filter(self, qs, value):
        if value:
            regs = regions.models.GeographicRegion.objects.filter(slug=value)
            if regs:
                reg = regs[0]
                if reg.parent and reg.parent.parent:
                    qs = qs.filter(Q(region=reg) | Q(
                        region=reg.parent) | Q(region=reg.parent.parent))
                elif reg.parent:
                    qs = qs.filter(Q(region=reg) | Q(region=reg.parent))
                else:
                    qs = qs.filter(Q(region=reg))
        return qs


class ServiceFilter(django_filters.FilterSet):
    additional_info = CharAnyLanguageFilter('additional_info')
    geographic_region = RegionFilter()
    description = CharAnyLanguageFilter('description')
    name = CharAnyLanguageFilter('name')
    type_name = CharAnyLanguageFilter('types__name')
    type_numbers = ServiceTypeNumbersFilter()
    id = django_filters.NumberFilter()
    closest = SortByDistanceFilter()
    provider = django_filters.NumberFilter('provider__id')
    address_city = CharAnyLanguageFilter('address_city')


    class Meta:
        model = Service
        fields = ['name', 'description',
                  'additional_info', 'type_name', 'type_numbers', 'id', 'provider', 'status']


class PrivateServiceFilter(ServiceFilter):
    geographic_region = CustomRegionFilter()

    class Meta:
        model = Service
        fields = ['name', 'description',
                  'additional_info', 'type_name', 'type_numbers', 'id', 'provider', 'status']


class CustomServiceFilter(ServiceFilter):
    geographic_region = CustomRegionFilter()

    class Meta:
        model = Service
        fields = ['name', 'description',
                  'additional_info', 'type_name', 'type_numbers', 'id', 'provider']


class RelativesServiceFilter(ServiceFilter):
    geographic_region = RelativesRegionFilter()

    class Meta:
        model = Service
        fields = ['name', 'description',
                  'additional_info', 'type_name', 'type_numbers', 'id', 'provider']


class WithParentsServiceFilter(ServiceFilter):
    geographic_region = WithParentsRegionFilter()

    class Meta:
        model = Service
        fields = ['name', 'description',
                  'additional_info', 'type_name', 'type_numbers', 'id', 'provider']


class GeographicRegionFilter(django_filters.FilterSet):
    hidden = django_filters.BooleanFilter()
    parent = django_filters.NumberFilter()
    level = django_filters.ChoiceFilter(
        choices=GeographicRegion._meta.get_field('level').choices)

    class Meta:
        model = GeographicRegion
        fields = ['parent', 'hidden']


class NewsletterEmailTemplateFilter(django_filters.FilterSet):
    type = django_filters.CharFilter()

    class Meta:
        model = NewsletterEmailTemplate
        fields = ['type']

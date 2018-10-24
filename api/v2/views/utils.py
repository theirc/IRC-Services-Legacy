import logging
import json
from django.db.models import Q

from rest_framework import pagination, permissions

logger = logging.getLogger(__name__)


class IsSuperUserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser


class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size_query_param = 'page_size'


class FilterByRegionMixin(object):
    def get_queryset(self):
        qs = super(FilterByRegionMixin, self).get_queryset()
        if hasattr(self.request, 'region'):
            return qs.filter(Q(region=self.request.region.id) | Q(region__parent=self.request.region.id) | Q(region__parent__parent=self.request.region.id))
        elif hasattr(self.request.user, 'site') and self.request.user.site:
            return qs.filter(Q(region__site=self.request.user.site) | Q(region__parent__site=self.request.user.site) | Q(region__parent__parent__site=self.request.user.site))
        else:
            return qs

def format_opening_hours(opening_hours):
    hours = json.loads(opening_hours)
    weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    s = ''

    if hours['24/7']:
        s += '24/7: yes'
    else:
        for day in weekdays:
            s += day.capitalize() + ': ' + hours[day][0]['open'][0:-3] + ' (open) - ' + hours[day][0]['close'][0:-3] + ' (close) | ' if hours[day][0]['open'] else ''

    return s
import logging
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
        if self.request.region:
            return qs.filter(Q(region=self.request.region.id) | Q(region__parent=self.request.region.id) | Q(region__parent__parent=self.request.region.id))
        else:
            return qs

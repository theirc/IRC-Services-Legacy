import logging

from rest_framework import pagination, permissions

logger = logging.getLogger(__name__)


class IsSuperUserPermission(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_superuser


class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size_query_param = 'page_size'

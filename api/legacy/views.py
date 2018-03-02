import json
import logging
from http.client import BAD_REQUEST

import django_filters
import functools
import requests
from django.views.decorators.csrf import csrf_exempt

from lxml.html.diff import htmldiff
import diff_match_patch

from django.db.models import F, Count, Sum, Avg

from api.serializers import UserSerializer, GroupSerializer, ServiceSerializer, \
    ProviderTypeSerializer, ServiceAreaSerializer, APILoginSerializer, APIActivationSerializer, \
    PasswordResetRequestSerializer, PasswordResetCheckSerializer, PasswordResetSerializer, \
    ResendActivationLinkSerializer, CreateProviderSerializer, ServiceTypeSerializer, \
    SelectionCriterionSerializer, LanguageSerializer, ServiceSearchSerializer, \
    ProviderFetchSerializer, FeedbackSerializer, NationalitySerializer, ImportSerializer, \
    RequestForServiceSerializer, ProviderSerializer, GeographicRegionSerializer, \
    ImportantInformationSerializer, GeographicRegionSerializerNoContent, PageSerializer, PageByRegionSerializer, \
    GeographicRegionSerializerSimple, \
    PageSerializerList, UserPermissionSerializer, PageSerializerCreateUpdate, PageContentSerializer, \
    GeographicRegionSerializerV2, SimplePageSerializer, SimplePageByRegionSerializer, \
    GeographicRegionSerializerV2NoContent, ServiceSimpleSerializer, LatestPageSerializer
from api.utils import generate_translated_fields
from api.v2.filters import AnalyticsContentFilter
from cms.models import Page, Rating, PageOrderingInRegion
from cms.utils import push_to_transifex, pull_completed_from_transifex, get_transifex_info
from django.conf import settings
from django.contrib.auth import get_user_model, login
from django.contrib.auth.models import Group
from django.contrib.gis.geos import Point
from django.core import signing
from django.core.exceptions import ValidationError as DjangoValidationError
from django.core.urlresolvers import reverse
from django.db.models import Q
from django.db.transaction import atomic
from django.http import HttpResponse
from django.http import HttpResponseRedirect
from django.http import JsonResponse
from django.utils.timezone import now
from django.utils.translation import ugettext_lazy as _
from email_user.models import EmailUser
from regions.models import GeographicRegion, ImportantInformation
from rest_framework import mixins, parsers, renderers, status, viewsets
from rest_framework import pagination
from rest_framework.authtoken.models import Token
from rest_framework.decorators import list_route, detail_route, api_view, permission_classes
from rest_framework.exceptions import ValidationError as DRFValidationError, PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.viewsets import GenericViewSet
from services.models import Service, Provider, ProviderType, ServiceArea, ServiceType, \
    SelectionCriterion, Feedback, Nationality, RequestForService

logger = logging.getLogger(__name__)


class TranslatedViewMixin(object):
    def perform_authentication(self, request):
        super().perform_authentication(request)


class ServiceInfoGenericViewSet(TranslatedViewMixin, viewsets.GenericViewSet):
    """A view set that allows for translated fields, but doesn't provide any
    specific view methods (like list or detail) by default."""
    pass


class ServiceInfoAPIView(TranslatedViewMixin, APIView):
    pass


class ServiceInfoModelViewSet(TranslatedViewMixin, viewsets.ModelViewSet):
    pass


class NonEmptyFilter(django_filters.BooleanFilter):
    """
    Non-empty filter that works on TextFields.
    """

    def filter(self, qs, value):
        if value:
            qs = qs.filter(**{'%s__isnull' % self.name: False})
            return qs.exclude(**{self.name: ''})
        else:
            return qs.filter(Q(**{'%s__isnull' % self.name: True}) | Q(**{self.name: ''}))


class FeedbackFilter(django_filters.FilterSet):
    service = django_filters.NumberFilter()
    extra_comments = NonEmptyFilter()
    delivered = django_filters.BooleanFilter()
    anonymous = django_filters.BooleanFilter()

    class Meta:
        model = Feedback
        fields = ['service', 'extra_comments', 'delivered', 'anonymous']


class FeedbackViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin, mixins.CreateModelMixin,
                      GenericViewSet):
    """A write-only viewset for feedback"""
    permission_classes = [AllowAny]
    queryset = Feedback.objects.all()
    serializer_class = FeedbackSerializer
    filter_class = FeedbackFilter


class LanguageView(ServiceInfoAPIView):
    """
    Lookup the authenticated user's preferred language.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request, format=None):
        return Response({'language': request.user.language})

    def post(self, request):
        serializer = LanguageSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        request.user.language = serializer.data['language']
        request.user.save()
        return Response()


class UserViewSet(ServiceInfoModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    permission_classes = [IsAuthenticated]
    queryset = EmailUser.objects.all()
    serializer_class = UserSerializer

    def get_queryset(self):
        # Limit to user's own user object
        return self.queryset.filter(pk=self.request.user.pk)

    def update(self, request, *args, **kwargs):
        # Don't allow users to change their email
        instance = self.get_object()
        request.data['email'] = instance.email
        return super().update(request, *args, **kwargs)


class GroupViewSet(ServiceInfoModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class NationalityViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin,
                         ServiceInfoGenericViewSet):
    """
    Read-only API for nationality. You can list them or get one, but
    cannot add, change, or delete them.
    """
    permission_classes = [AllowAny]
    queryset = Nationality.objects.all()
    serializer_class = NationalitySerializer


class CompositeRegionSlugFilter(django_filters.CharFilter):
    """
    Slug filter that splits the slug using this token '--' and adds filter by parents
    """

    def filter(self, qs, value):
        if not len(value):
            return qs
        try:
            slugs = value.split('--')
            principal = slugs[-1]
            parents = reversed(slugs[0:-1])
            slug_filter = {'slug': principal}

            for i, p in enumerate(parents):
                slug_filter.update({"parent{}__slug".format(i * "__parent"): p})

            return qs.filter(**slug_filter)
        except ValueError:
            return qs


class ChildOfRegionFilter(django_filters.CharFilter):
    """
    Filter that gets all regions that belong to a parent region or one of its children
    """

    def filter(self, qs, value):
        if not len(value):
            return qs
        try:
            parent_filter = Q(parent__id=value)
            parent_filter = parent_filter | Q(parent__parent__id=value)
            parent_filter = parent_filter | Q(parent__parent__parent__id=value)
            parent_filter = parent_filter | Q(parent__parent__parent__parent__id=value)
            parent_filter = parent_filter | Q(parent__parent__parent__parent__parent__id=value)
            return qs.filter(parent_filter)
        except ValueError:
            return qs


class CompositeInformationSlugFilter(django_filters.CharFilter):
    """
    Slug filter that splits the slug using this token '--' and adds filter by parents
    """

    def filter(self, qs, value):
        if not len(value):
            return qs
        try:
            slugs = value.split('--')
            principal = slugs[-1]
            parents = reversed(slugs[0:-1])
            slug_filter = {'slug': principal}

            for i, p in enumerate(parents):
                slug_filter.update({"region{}__slug".format(i * "__parent"): p})

            return qs.filter(**slug_filter)
        except ValueError:
            return qs


class ClosestToPointFilter(django_filters.CharFilter):
    """Returns objects whose geometry contain specified point (lat,long format)"""

    def filter(self, qs, value):
        if not len(value):
            return qs
        try:
            lat, long = [float(x) for x in value.split(',', 1)]
        except ValueError:
            return []
        search_point = Point(long, lat)
        return qs.filter(geom__contains=search_point).order_by('-level')[0:1] or qs.distance(search_point).order_by(
            'distance')[0:1]


class PointGeometryFilter(django_filters.CharFilter):
    """Returns objects whose geometry contain specified point (lat,long format)"""

    def filter(self, qs, value):
        if not len(value):
            return qs
        try:
            lat, long = [float(x) for x in value.split(',', 1)]
        except ValueError:
            return qs
        search_point = Point(long, lat)
        return qs.filter(**{'%s__contains' % self.name: search_point})


class GeographicRegionFilter(django_filters.FilterSet):
    hidden = django_filters.BooleanFilter()
    parent = django_filters.NumberFilter()
    slug = CompositeRegionSlugFilter()
    is_child_of = ChildOfRegionFilter()
    level = django_filters.ChoiceFilter(choices=GeographicRegion._meta.get_field('level').choices)
    point = PointGeometryFilter(name='geom')
    closest = ClosestToPointFilter()

    class Meta:
        model = GeographicRegion
        fields = ['parent', 'level', 'point']


class ImportantInformationFilter(django_filters.FilterSet):
    region = django_filters.NumberFilter()
    slug = CompositeInformationSlugFilter()

    class Meta:
        model = ImportantInformation
        fields = ['region', 'slug', ]


class GeographicRegionViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin,
                              ServiceInfoGenericViewSet):
    """
    Read-only API for nationality. You can list them or get one, but
    cannot add, change, or delete them.
    """
    permission_classes = [AllowAny]
    queryset = GeographicRegion.objects.prefetch_related('pages_with_order__page',
                                                         'pages_with_order__page__content_items',
                                                         'pages_with_order__page__content_items__content_object',
                                                         'pages_with_order__page__content_items__content_type') \
        .select_related('parent',
                        'parent__parent',
                        'parent__parent__parent').all()
    serializer_class = GeographicRegionSerializer
    filter_class = GeographicRegionFilter

    def get_queryset(self):
        queryset = self.queryset

        if hasattr(self.request, 'geo_region') and self.request.geo_region:
            geo_region = self.request.geo_region
            restrict = geo_region.restrict_access_to or ''
            restrict = ",".join([restrict] + [p.restrict_access_to for p in geo_region.parents if p.restrict_access_to])
            list_restrictions = [r.strip() for r in restrict.split(',') if r]

            if list_restrictions:
                queryset = queryset.exclude(
                    Q(code__in=list_restrictions) |
                    Q(parent__code__in=list_restrictions) |
                    Q(parent__parent__code__in=list_restrictions)
                )
        if hasattr(self.request, 'ip_information') and self.request.ip_information:
            lat, long = self.request.ip_information.latitude, self.request.ip_information.longitude
            point = Point(float(long), float(lat))
            queryset = queryset.distance(point).order_by('distance')

        if hasattr(self.request, 'location_information') and self.request.location_information:
            lat, long = self.request.location_information['latitude'], self.request.location_information['longitude']
            point = Point(float(long), float(lat))
            queryset = queryset.distance(point).order_by('distance')

        return queryset

    def get_serializer_class(self):
        if 'no_content' in self.request.GET:
            return GeographicRegionSerializerNoContent
        if 'simple' in self.request.GET:
            return GeographicRegionSerializerSimple
        else:
            return GeographicRegionSerializer

    @list_route(methods=['get'], permission_classes=[AllowAny])
    def closest(self, request, *args, **kwargs):
        if (hasattr(self.request, 'ip_information') and self.request.ip_information) or \
                (hasattr(self.request, 'location_information') and self.request.location_information):
            queryset = self.get_queryset().order_by('distance', '-level')
        else:
            queryset = self.get_queryset().order_by('-level', '-id')

        queryset = self.filter_queryset(queryset)
        context = self.get_serializer_context()
        serializer = self.get_serializer_class()(
            queryset[0:1],
            many=True,
            context=context
        )

        return Response(serializer.data)

    def __get_rating_object(self, request, environment='production'):
        if request.method == 'POST':
            region_slug = request.data.get('region_slug')
            content_slug = request.data.get('info_slug')
            index = request.data.get('index')
        else:
            region_slug = request.query_params.get('region_slug')
            content_slug = request.query_params.get('content_slug')
            index = request.query_params.get('index')
        region = self.get_queryset().filter(slug=region_slug)[0]
        if content_slug:
            content_rates = Rating.objects.filter(page__slug=content_slug, page__status=environment)
        else:
            pages = PageOrderingInRegion.objects.filter(region=region, index=index, page__status=environment)
            if pages:
                content_rates = pages[0].page.ratings
            else:
                content_rates = Rating.objects.none()
        return {
            "thumbs_up": sum([1 for c in content_rates.filter(rating=1)]),
            "thumbs_down": sum([1 for c in content_rates.filter(rating=-1)]),
        }

    def __record_rating(self, request, rating, environment='production'):
        if request.method == 'POST':
            region_slug = request.data.get('region_slug')
            content_slug = request.data.get('info_slug')
            index = request.data.get('index')
        else:
            region_slug = request.query_params.get('region_slug')
            content_slug = request.query_params.get('content_slug')
            index = request.query_params.get('index')
        region = self.get_queryset().filter(slug=region_slug)[0]

        if content_slug:
            page = Page.objects.get(slug=content_slug, status=environment)
            content_rates = Rating.objects.create(page=page, rating=rating)
        else:
            pages = PageOrderingInRegion.objects.filter(region=region, index=index, page__status=environment)
            if pages:
                content_rates = Rating.objects.create(page=pages[0].page, rating=rating)

    def __remove_rating(self, request, rating, environment='production'):
        if request.method == 'POST':
            region_slug = request.data.get('region_slug')
            content_slug = request.data.get('info_slug')
            index = request.data.get('index')
        else:
            region_slug = request.query_params.get('region_slug')
            content_slug = request.query_params.get('content_slug')
            index = request.query_params.get('index')
        region = self.get_queryset().filter(slug=region_slug)[0]

        if content_slug:
            page = Page.objects.get(slug=content_slug, status=environment)
            content_rates = Rating.objects.filter(page=page, rating=rating)
            if content_rates:
                content_rates[0].delete()
        else:
            pages = PageOrderingInRegion.objects.filter(region=region, index=index, page__status=environment)
            if pages:
                content_rates = Rating.objects.filter(page=pages[0].page, rating=rating, page__status=environment)
                if content_rates:
                    content_rates[0].delete()

    @list_route(methods=['get'], permission_classes=[AllowAny])
    def get_rate(self, request, environment='production'):
        content_rate = self.__get_rating_object(request, environment)
        return Response(content_rate)

    @list_route(methods=['post'], permission_classes=[AllowAny])
    def add_rate(self, request, environment='production'):
        rate = request.data.get('rate')
        if rate == 'up':
            self.__record_rating(request, 1, environment)
        elif rate == 'down':
            self.__record_rating(request, -1, environment)

        content_rate = self.__get_rating_object(request, environment)

        return Response(content_rate)

    @list_route(methods=['post'], permission_classes=[AllowAny])
    def remove_rate(self, request, environment='production'):
        rate = request.data.get('rate')
        if rate == 'up':
            self.__remove_rating(request, 1, environment)
        elif rate == 'down':
            self.__remove_rating(request, -1, environment)

        content_rate = self.__get_rating_object(request, environment)

        return Response(content_rate)


class ServiceAreaViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin,
                         ServiceInfoGenericViewSet):
    permission_classes = [AllowAny]
    queryset = ServiceArea.objects.all()
    serializer_class = ServiceAreaSerializer


class ImportantInformationViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin,
                                  ServiceInfoGenericViewSet):
    permission_classes = [AllowAny]
    queryset = ImportantInformation.objects.none()
    serializer_class = ImportantInformationSerializer
    filter_class = ImportantInformationFilter


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


class ServiceTypeNumbersFilter(django_filters.CharFilter):
    """
    Filter service records where their service type has any of the
    numbers given in a comma-separated string.
    """

    def filter(self, qset, value):
        if not len(value):
            return qset
        return qset.filter(type__number__in=[int(s) for s in value.split(',')])


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


class RequestForServiceViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    queryset = RequestForService.objects.all()
    serializer_class = RequestForServiceSerializer


class ServiceFilter(django_filters.FilterSet):
    additional_info = CharAnyLanguageFilter('additional_info')
    geographic_region = django_filters.CharFilter('region__slug')
    description = CharAnyLanguageFilter('description')
    name = CharAnyLanguageFilter('name')
    type_name = CharAnyLanguageFilter('type__name')
    type_numbers = ServiceTypeNumbersFilter()
    id = django_filters.NumberFilter()
    closest = SortByDistanceFilter()

    class Meta:
        model = Service
        fields = ['name', 'description',
                  'additional_info', 'type_name', 'type_numbers', 'id']


class StandardResultsSetPagination(pagination.PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 1000


class ServiceViewSet(ServiceInfoModelViewSet):
    # This docstring shows up when browsing the API in a web browser:
    """
    Service view

    In addition to the usual URLs, you can append 'cancel/' to
    the service's URL and POST to cancel a service that's in
    draft or current state.  (User must be the provider or superuser).
    """
    filter_class = ServiceFilter
    is_search = False
    is_get_for_spp = False
    # The queryset is only here so DRF knows the base model for this View.
    # We override it below in all cases.
    queryset = Service.objects.select_related('provider', 'type', 'region') \
        .prefetch_related('selection_criteria').all()
    serializer_class = ServiceSerializer
    pagination_class = StandardResultsSetPagination

    # All the text fields that are used for full-text searches (?search=XXXXX)
    search_fields = generate_translated_fields('additional_info', False) \
                    + ['cost_of_service'] \
                    + generate_translated_fields('description', False) \
                    + generate_translated_fields('name', False) \
                    + generate_translated_fields('region__name', False) \
                    + generate_translated_fields('type__comments', False) \
                    + generate_translated_fields('type__name', False) \
                    + generate_translated_fields('provider__description', False) \
                    + generate_translated_fields('provider__focal_point_name', False) \
                    + ['provider__focal_point_phone_number'] \
                    + generate_translated_fields('provider__address', False) \
                    + generate_translated_fields('provider__name', False) \
                    + generate_translated_fields('provider__type__name', False) \
                    + ['provider__phone_number', 'provider__website', 'provider__user__email'] \
                    + generate_translated_fields('selection_criteria__text', False) \
                    + ['region__slug']

    def get_queryset(self):
        # Only make visible the Services owned by the current provider
        if self.is_search or self.is_get_for_spp:
            qs = self.queryset.filter(status=Service.STATUS_CURRENT)
        else:
            qs = self.queryset.filter(provider__user__pk=self.request.user.pk) \
                .exclude(status=Service.STATUS_CANCELED)
        if not self.request.GET.get('closest', None):
            language = getattr(self.request.user, 'language', None) or 'en'
            qs = qs.order_by('name_' + language)
        return qs

    @detail_route(methods=['post'])
    def cancel(self, request, *args, **kwargs):
        """Cancel a service. Should be current or draft"""
        obj = self.get_object()
        if obj.status not in [Service.STATUS_DRAFT, Service.STATUS_CURRENT]:
            raise DRFValidationError(
                {'status': _('Service record must be current or pending changes to be canceled')})
        obj.cancel()
        return Response()

    @list_route(methods=['get'], permission_classes=[AllowAny])
    def search(self, request, *args, **kwargs):
        """
        Public API for searching public information about the current services
        """
        self.is_search = True
        self.serializer_class = ServiceSearchSerializer
        return super().list(request, *args, **kwargs)

    @list_route(methods=['get'], permission_classes=[IsAuthenticatedOrReadOnly])
    def get_for_spp(self, request, *args, **kwargs):
        """
        Public API to get all current services without pagination
        """
        self.is_get_for_spp = True
        self.pagination_class = None
        self.serializer_class = ServiceSimpleSerializer
        return super().list(request, *args, **kwargs)


class SelectionCriterionViewSet(ServiceInfoModelViewSet):
    queryset = SelectionCriterion.objects.all()
    serializer_class = SelectionCriterionSerializer

    def get_queryset(self):
        # Only make visible the SelectionCriteria owned by the current provider
        # (attached to services of the current provider)
        return self.queryset.filter(service__provider__user__pk=self.request.user.pk)

    def get_object(self):
        # Users can only access their own records
        # Overriding get_queryset() should be enough, but just in case...
        obj = super().get_object()
        if not obj.provider.user == self.request.user:
            raise PermissionDenied
        return obj


class ProviderTypeViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin,
                          ServiceInfoGenericViewSet):
    """
    Look up provider types.

    (Read-only - no create, update, or delete provided)
    """
    # Unauth'ed users need to be able to read the provider types so
    # they can register as providers.
    permission_classes = [AllowAny]
    queryset = ProviderType.objects.all()
    serializer_class = ProviderTypeSerializer


class ServiceTypeViewSet(mixins.RetrieveModelMixin, mixins.ListModelMixin,
                         ServiceInfoGenericViewSet):
    """
    Look up service types.

    (Read-only - no create, update, or delete provided)
    """
    permission_classes = [AllowAny]
    queryset = ServiceType.objects.all()
    serializer_class = ServiceTypeSerializer


class ProviderViewSet(ServiceInfoModelViewSet):
    # This docstring shows up when browsing the API in a web browser:
    """
    Provider view

    For providers to create/update their own data.

    In addition to the usual URLs, you can append 'create_provider/' to
    the provider URL and POST to create a new user and provider.

    POST the fields of the provider, except instead of passing the
    user, pass an 'email' and 'password' field so we can create the user
    too.

    The user will be created inactive. An email message will be sent
    to them with a link they'll have to click in order to activate their
    account. After clicking the link, they'll be redirected to the front
    end, logged in and ready to go.
    """

    queryset = Provider.objects.all()
    serializer_class = ProviderSerializer

    @detail_route(methods=['get'], permission_classes=[AllowAny])
    def fetch(self, request, pk=None):
        # Get a provider anonymously using /api/providers/<id>/fetch/
        instance = Provider.objects.get(pk=int(pk))
        serializer = ProviderFetchSerializer(instance, context={'request': request})
        return Response(serializer.data)

    def get_queryset(self):
        # If user is authenticated, it's not a create_provider call.
        # Limit visible providers to the user's own.
        if self.request.user.is_authenticated():
            return self.queryset.filter(user=self.request.user)
        return self.queryset.all()  # Add ".all()" to force re-evaluation each time

    def get_object(self):
        # Users can only access their own records
        # Overriding get_queryset() should be enough, but just in case...
        obj = super().get_object()
        if not obj.user == self.request.user:
            raise PermissionDenied
        return obj

    def update(self, request, *args, **kwargs):
        """On change to provider via the API, notify via JIRA"""
        response = super().update(request, *args, **kwargs)
        self.get_object().notify_jira_of_change()
        return response

    @list_route(methods=['post'], permission_classes=[AllowAny])
    def create_provider(self, request, *args, **kwargs):
        """
        Customized "create provider" API call.

        This is distinct from the built-in 'POST to the list URL'
        call because we need it to work for users who are not
        authenticated (otherwise, they can't register).

        Expected data is basically the same as for creating a provider,
        except that in place of the 'user' field, there should be an
        'email' and 'password' field.  They'll be used to create a new user,
        send them an activation email, and create a provider using
        that user.
        """
        with atomic():  # If we throw an exception anywhere in here, rollback all changes
            serializer = CreateProviderSerializer(data=request.data)
            serializer.is_valid(raise_exception=True)

            # Create User
            user = get_user_model().objects.create_user(
                email=request.data['email'],
                password=request.data['password'],
                is_active=False
            )
            provider_group, _ = Group.objects.get_or_create(name='Providers')
            user.groups.add(provider_group)

            # Create Provider
            data = dict(request.data, user=user.get_api_url())
            serializer = ProviderSerializer(data=data, context={'request': request})
            serializer.is_valid(raise_exception=True)
            serializer.save()  # returns provider if we need it
            headers = self.get_success_headers(serializer.data)

            # If we got here without blowing up, send the user's activation email
            user.send_activation_email(request.site, request, data['base_activation_link'])
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @list_route(methods=['post'], permission_classes=[AllowAny])
    def claim_service(self, request, *args, **kwargs):
        try:
            with atomic():
                if request.user.groups.filter(name='Providers').exists():
                    user = request.user
                else:
                    try:
                        user = get_user_model().objects.create_user(
                            email=request.data['email'],
                            password=get_user_model().objects.make_random_password(),
                            is_active=False
                        )
                    except DjangoValidationError:
                        raise DjangoValidationError('User with this email exists')
                    provider_group, _ = Group.objects.get_or_create(name='Providers')
                    user.groups.add(provider_group)

                # Create or update Provider
                data = dict(request.data, user=user.get_api_url())
                if hasattr(user, 'provider'):
                    serializer = ProviderSerializer(user.provider, data=data, context={'request': request})
                else:
                    serializer = ProviderSerializer(data=data, context={'request': request})
                try:
                    serializer.is_valid(raise_exception=True)
                except DRFValidationError:
                    raise DjangoValidationError('All fields needs to be filled.')
                serializer.save()
                headers = self.get_success_headers(serializer.data)
                service = Service.objects.get(id=request.data['service_id'])
                user.send_activation_email_to_staff(request, service, serializer.instance)
                return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)
        except DjangoValidationError as ex:
            return Response('; '.join(ex.messages), status=status.HTTP_400_BAD_REQUEST)
        except Exception as ex:
            logger.error(
                'There was an error during claim',
                exc_info=True,
            )
            return Response(str(ex), status=status.HTTP_400_BAD_REQUEST)


#
# UNAUTHENTICATED views
#

class APILogin(ServiceInfoAPIView):
    """
    Allow front-end to pass us an email and a password and get
    back an auth token for the user.

    (Adapted from the corresponding view in DRF for our email-based
    user model.)
    """
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)

    def post(self, request):
        serializer = APILoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        user.last_login = now()
        user.save(update_fields=['last_login'])
        login(request, user)
        return Response({'token': token.key,
                         'language': user.language,
                         'email': user.email,
                         'is_staff': user.is_staff})


class APIActivationView(ServiceInfoAPIView):
    """
    Given a user activation key, activate the user and
    return an auth token.
    """
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)

    def post(self, request):
        serializer = APIActivationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        activation_key = serializer.validated_data['activation_key']

        try:
            user = get_user_model().objects.activate_user(activation_key=activation_key)
        except DjangoValidationError as e:  # pragma: no cover
            # The serializer already checked the key, so about the only way this could
            # have failed would be due to another request having activated the user
            # between our checking and our trying to activate them ourselves.  Still,
            # it's theoretically possible, so handle it...
            raise DRFValidationError(e.messages)

        token, unused = Token.objects.get_or_create(user=user)
        user.last_login = now()
        user.save(update_fields=['last_login'])
        return Response({'token': token.key, 'email': user.email})


class PasswordResetRequest(ServiceInfoAPIView):
    """
    View to tell the API that a user wants to reset their password.
    If the provided email is for a valid user, it sends them an
    email with a link they can use.
    """

    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)

    def post(self, request):
        serializer = PasswordResetRequestSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        base_url = serializer.validated_data['base_reset_link']
        user = serializer.validated_data['user']
        user.send_password_reset_email(base_url, request.site)
        return Response()


class PasswordResetCheck(ServiceInfoAPIView):
    """
    View to check if a password reset key appears to
    be valid (at the moment).
    """
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)

    def post(self, request):
        # The serializer validation does all the work in this one
        serializer = PasswordResetCheckSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'email': serializer.validated_data['user'].email})


class PasswordReset(ServiceInfoAPIView):
    """
    View to reset a user's password, given a reset key
    and a new password.
    """
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)

    def post(self, request):
        serializer = PasswordResetSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        password = serializer.validated_data['password']
        user.set_password(password)
        user.save()
        token, unused = Token.objects.get_or_create(user=user)
        user.last_login = now()
        user.save(update_fields=['last_login'])
        return Response({'token': token.key, 'email': user.email})


class ResendActivationLinkView(ServiceInfoAPIView):
    """
    View to resend the activation link for the user
    """
    throttle_classes = ()
    permission_classes = ()
    parser_classes = (parsers.FormParser, parsers.MultiPartParser, parsers.JSONParser,)
    renderer_classes = (renderers.JSONRenderer,)

    def post(self, request):
        serializer = ResendActivationLinkSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        user.send_activation_email(request.site, request, request.data['base_activation_link'])
        return Response()


class GetExportURLView(APIView):
    """Return a signed time-limited URL for downloading an export"""
    permission_classes = (IsAuthenticated,)

    def get(self, request):
        user = request.user
        thing_to_sign = {'u': user.id, 'what': 'export'}
        signature = signing.dumps(thing_to_sign)
        export_url = reverse('export', kwargs={'signature': signature})
        return Response({'url': export_url})


class ImportView(APIView):
    parser_classes = (parsers.MultiPartParser, parsers.FormParser)
    permission_classes = (IsAuthenticated,)

    def post(self, request):
        serializer = ImportSerializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data
        if 'errors' in data:
            return Response(data={'errors': data['errors']}, status=BAD_REQUEST)
        return Response()


#
# V2 only views
#

class GeographicRegionViewSetV2(viewsets.ReadOnlyModelViewSet):
    permission_classes = [AllowAny]
    queryset = GeographicRegion.objects.select_related('parent').prefetch_related('pages_with_order',
                                                                                  'pages_with_order__page').all()
    serializer_class = GeographicRegionSerializerV2
    filter_class = GeographicRegionFilter
    lookup_field = 'slug'

    def get_queryset(self):
        queryset = self.queryset

        if hasattr(self.request, 'geo_region') and self.request.geo_region:
            geo_region = self.request.geo_region
            restrict = geo_region.restrict_access_to or ''
            restrict = ",".join([restrict] + [p.restrict_access_to for p in geo_region.parents if p.restrict_access_to])
            list_restrictions = [r.strip() for r in restrict.split(',') if r]

            if list_restrictions:
                queryset = queryset.exclude(
                    Q(code__in=list_restrictions) |
                    Q(parent__code__in=list_restrictions) |
                    Q(parent__parent__code__in=list_restrictions)
                )
        if hasattr(self.request, 'ip_information') and self.request.ip_information:
            lat, long = self.request.ip_information.latitude, self.request.ip_information.longitude
            point = Point(float(long), float(lat))
            queryset = queryset.distance(point).order_by('distance')

        if hasattr(self.request, 'location_information') and self.request.location_information:
            lat, long = self.request.location_information['latitude'], self.request.location_information['longitude']
            point = Point(float(long), float(lat))
            queryset = queryset.distance(point).order_by('distance')

        return queryset

    def get_serializer_class(self):
        if 'simple' in self.request.GET:
            return GeographicRegionSerializerSimple
        if 'no_content' in self.request.GET:
            return GeographicRegionSerializerV2NoContent
        else:
            return self.serializer_class

    @list_route(methods=['get'], permission_classes=[AllowAny])
    def closest(self, request, *args, **kwargs):
        if (hasattr(self.request, 'ip_information') and self.request.ip_information) or \
                (hasattr(self.request, 'location_information') and self.request.location_information):
            queryset = self.get_queryset().order_by('distance', '-level')
        else:
            queryset = self.get_queryset().order_by('-level', '-id')

        queryset = self.filter_queryset(queryset)
        context = self.get_serializer_context()
        serializer = self.get_serializer_class()(
            queryset[0:1],
            many=True,
            context=context
        )
        return Response(serializer.data)

    @detail_route(methods=['post'])
    def publish(self, request, **kwargs):
        region = self.get_object()
        for page in region.pages_with_order.filter(page__status='staging'):
            page.page.publish()
        return Response({'status': region.id})


class SimplePagebyRegionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = GeographicRegion.objects.prefetch_related(
        *functools.reduce(lambda a, b: a + b, [
            [('children__' * d) + c for c in [
                'children',
                'pages_with_order',
                'pages_with_order__page',
                'pages_with_order__page__content_items'
            ]] for d in range(0, 3)
            ], [])

    ).filter(parent=None)
    lookup_field = 'slug'
    serializer_class = SimplePageByRegionSerializer


class PagebyRegionViewSet(viewsets.ModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = GeographicRegion.objects.prefetch_related(
        'pages_with_order',
        'pages_with_order__page',
        'pages_with_order__page__content_items')
    lookup_field = 'slug'
    serializer_class = PageByRegionSerializer

    def retrieve(self, request, *args, **kwargs):
        if self.kwargs.get('slug') == '-':
            return Response()
        return super().retrieve(request, *args, **kwargs)


class SpecificOrEmptyFilter(django_filters.CharFilter):
    """
    Filter that gets all records that match this filter or are empty
    """

    def filter(self, qs, value):
        if value:
            return qs.filter(Q(**{'%s__isnull' % self.name: True}) | Q(**{'%s__slug' % self.name: value}))
        else:
            return qs


class PageFilter(django_filters.FilterSet):
    limited_to = SpecificOrEmptyFilter()

    class Meta:
        model = Page
        fields = ['slug', 'status']


class SimplePageViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Page.objects.select_related('copy').prefetch_related(
        'translations',
        'ratings', ).all()
    lookup_field = 'slug'

    filter_class = PageFilter
    serializer_class = SimplePageSerializer


class LatestPageViewSet(mixins.ListModelMixin, GenericViewSet):
    permission_classes = [AllowAny]
    queryset = Page.objects.filter(status='staging').order_by('-updated_at')
    serializer_class = LatestPageSerializer
    pagination_class = StandardResultsSetPagination
    filter_class = AnalyticsContentFilter


class PageViewSet(viewsets.ModelViewSet):
    permission_classes = [AllowAny]
    queryset = Page.objects.select_related('copy').prefetch_related(
        'translations',
        'ratings',
        'regions',
        'content_items',
        'content_items__content_type',
        'content_items__content_object'
    ).filter()
    lookup_field = 'slug'

    filter_class = PageFilter

    def destroy(self, request, *args, **kwargs):
        environment = kwargs.get('environment', request.query_params.get('status', 'production'))
        if environment == 'staging':
            # Hard delete in case if page deleted from staging. Pages with assigned content will be deleted.
            page = Page.objects.get(slug=kwargs['slug'], status='staging')
            page.delete()
        elif environment == 'production':
            # Soft delete in case if page deleted from production. Page from production will have changed status.
            page = Page.objects.get(slug=kwargs['slug'], status='production')
            page.status = 'deleted'
            page.save()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def get_serializer_class(self):
        if getattr(self, 'action') == 'list':
            return PageSerializerList
        if getattr(self, 'action') in ('create', 'update'):
            return PageSerializerCreateUpdate
        return PageSerializer

    @detail_route(methods=['post'])
    def push_to_transifex(self, request, **kwargs):
        result = push_to_transifex(kwargs['slug'])
        return Response(result.info)

    @detail_route(methods=['get'])
    def pull_from_transifex(self, request, **kwargs):
        pulled_languages = pull_completed_from_transifex(kwargs['slug'])
        return Response(pulled_languages)

    @detail_route(methods=['get'])
    def get_transifex_data(self, request, **kwargs):
        r = get_transifex_info(kwargs['slug'])
        try:
            transifex_text = json.loads(r.text)
            languages = [i[0] for i in settings.LANGUAGES_CMS]
            output = dict((k, v['completed']) for k, v in transifex_text.items() if k in languages)
        except ValueError:
            if r.status_code == 404:
                output = {
                    'errors': 'Page has not been sent to transifex yet.'
                }
            else:
                output = {
                    'errors': 'An error occurred from transifex (%s).' % r.text
                }

        return Response(output)

    @detail_route(methods=['post'])
    def publish(self, request, **kwargs):
        p = Page.objects.get(slug=kwargs['slug'], status='staging')
        result = p.publish()
        if result:
            return Response({'success': 'Successfully published page'})

    @detail_route(methods=['get'])
    def compare(self, request, **kwargs):
        page_staging = Page.objects.get(slug=kwargs['slug'], status='staging')
        page_staging_html = page_staging.html()
        if not page_staging.copy:
            return Response({'errors': 'No published version to compare.'})
        page_production = page_staging.copy
        page_production_html = page_production.html()
        diff_obj = diff_match_patch.diff_match_patch()
        diffs = diff_obj.diff_main(page_production.title, page_staging.title)
        return Response({
            'html': htmldiff(page_production_html, page_staging_html),
            'title': diff_obj.diff_prettyHtml(diffs),
            'icon': page_staging.icon
        })


class UserPermissionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = EmailUser.objects.all()
    serializer_class = UserPermissionSerializer
    http_method_names = ['get']

    def list(self, request, *args, **kwargs):
        queryset = EmailUser.objects.get(pk=request.user.pk)
        serializer = self.get_serializer(queryset, many=False)
        return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_page_content(request, page_slug, language, **kwargs):
    status = kwargs.get('environment', request.query_params.get('status', 'production'))
    page = Page.objects.get(slug=page_slug, status=status)
    serializer = PageContentSerializer(page, language=language)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([AllowAny])
def get_about(request, language, **kwargs):
    status = kwargs.get('environment', request.query_params.get('status', 'production'))

    page, created = Page.objects.get_or_create(
        slug='about-us',
        status=status
    )
    if created:
        page.set_current_language('en')
        page.title = "About Us"
        page.hidden = True
        page.save()
    serializer = PageContentSerializer(page, language=language)
    return Response(serializer.data)


def activate_user(request):
    activation_key = request.GET['activation_key']
    user = get_user_model().objects.activate_user(activation_key=activation_key)
    return HttpResponseRedirect('/')


@csrf_exempt
def service_confirmation(request):
    confirmation_key = request.GET['confirmation_key']
    service_id = request.GET['service_id']
    service = Service.objects.get(id=service_id)
    body = json.loads(request.body.decode('utf-8'))
    log_status = body.get('status')
    note = body.get('note')
    service.confirm(confirmation_key=confirmation_key, log_status=log_status, note=note)
    return HttpResponseRedirect('/')


def get_json_response(token, user):
    json_response = {
        'token': token.key,
        'language': user.language,
        'email': user.email,
        'is_staff': user.is_staff,
        'is_superuser': user.is_superuser,
        'name': user.name,
        'surname': user.surname,
        'id': user.id
    }

    if user.avatar:
        json_response.update({'avatar': settings.MEDIA_URL + str(user.avatar)})

    return JsonResponse(json_response)


class ContentAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, **kwargs):
        countries = GeographicRegion.objects.filter(level=1)
        regions = []
        for country in countries:
            country_with_subregions = country.get_all_children()
            content_count = 0
            for location in country_with_subregions:
                content_count += location.pages_with_order.filter(page__status='production').count()
            regions.append({
                'name': country.name,
                'content_count': content_count,
                'subregions': country_with_subregions.count(),
                'avg_content_count': content_count / country_with_subregions.count()
            })

        data = {
            'published_count': Page.objects.filter(status='production').count(),
            'outdated_count': Page.objects.filter(status='staging', updated_at__gt=F('copy__created_at')).count(),
            'regions': regions
        }
        return Response(data)


class OutdatedContentAnalyticsView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, **kwargs):
        outdated = Page.objects.filter(status='staging', updated_at__gt=F('copy__created_at'))
        serializer = PageSerializer(outdated, many=True)
        return Response(serializer.data)

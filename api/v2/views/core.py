import logging

from django.conf import settings
from django.contrib.auth.models import Group
from django.contrib.sites.shortcuts import get_current_site
from django.views.generic import TemplateView
from django.shortcuts import redirect
from api.v2 import serializers as serializers_v2
from django.contrib.auth import get_user_model, login, logout
from django.db.transaction import atomic
from django.urls import reverse
from django.utils.timezone import now
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly
from api.utils import generate_translated_fields

from api.v2.serializers import UserAvatarSerializer, EmailSerializer, SecurePasswordCredentialsSerializer, \
    ResetUserPasswordSerializer, GroupSerializer, APILoginSerializer, APIRegisterSerializer
from email_user.models import EmailUser
from services.models import TypesOrdering
from regions.models import GeographicRegion
from rest_framework import permissions
from rest_framework import viewsets, mixins, parsers, renderers
from rest_framework.authtoken.models import Token
from rest_framework.decorators import list_route, detail_route, permission_classes, authentication_classes
from rest_framework.response import Response
from .utils import IsSuperUserPermission, StandardResultsSetPagination
from ..filters import GeographicRegionFilter
from rest_framework.views import APIView
from django.db.models.query_utils import Q
from django.contrib.sites.models import Site
from django.db import connections
import pymysql.cursors
# from django.core.cache import cache
# import time
# from django.db.models.signals import post_save, post_delete
# from django.dispatch import receiver
# import json

logger = logging.getLogger(__name__)


class SiteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Site.objects.all()
    serializer_class = serializers_v2.SiteSerializer


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer


class APIActivationView(TemplateView):
    template_name = 'admin_panel/activate.html'

    def get_context_data(self, **kwargs):
        context = super(APIActivationView, self).get_context_data(**kwargs)
        request = self.request
        context['activation_key'] = request.GET['activation_key']

        return context

    def get(self, request, *args, **kwargs):
        activation_key = request.GET.get('activation_key', '')
        users = get_user_model().objects.filter(activation_key=activation_key)
        if users.count() == 1:
            return super(APIActivationView, self).get(request, *args, **kwargs)
        else:
            return redirect('/')

    def post(self, request):
        activation_key = request.POST.get('activation_key', '')
        password = request.POST.get('password', '')

        if activation_key:
            try:
                user = get_user_model().objects.activate_user(activation_key=activation_key)
            except Exception as e:  # pragma: no cover
                pass
            token, unused = Token.objects.get_or_create(user=user)
            user.last_login = now()
            user.set_password(password)
            user.save()

        return redirect('/')


class UserViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows users to be viewed or edited.
    """
    queryset = EmailUser.objects.all()
    serializer_class = serializers_v2.UserSerializer
    pagination_class = StandardResultsSetPagination

    def get_serializer_class(self):
        if getattr(self, 'action') in ('retrieve', 'list'):
            return serializers_v2.UserWithGroupSerializer
        return super(UserViewSet, self).get_serializer_class()

    def get_permissions(self):
        if getattr(self, 'action') in ('retrieve', 'me', 'logout', 'partial_update', 'update'):
            self.permission_classes = [permissions.IsAuthenticated]
        elif getattr(self, 'action') in ('login', 'reset_password', 'reset_password_confirm',
                                         'reset_password_done'):
            self.permission_classes = [permissions.AllowAny]
        else:
            self.permission_classes = [IsSuperUserPermission]

        return super(UserViewSet, self).get_permissions()

    @list_route()
    def me(self, request):
        serializer_class = self.get_serializer_class()
        instance = request.user

        return Response(serializer_class(instance).data)

    @list_route(methods=['POST'])
    def login(self, request):
        serializer = APILoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        token, created = Token.objects.get_or_create(user=user)
        user.last_login = now()
        user.save(update_fields=['last_login'])
        login(request, user)

        response = {'token': token.key,
                    'language': user.language,
                    'email': user.email,
                    'isStaff': user.is_staff,
                    'isSuperuser': user.is_superuser,
                    'name': user.name,
                    'surname': user.surname,
                    'id': user.id,
                    'title': user.title,
                    'position': user.position,
                    'phone_number': user.phone_number
                    }

        if user.avatar:
            response.update({'avatar': settings.MEDIA_URL + str(user.avatar)})

        return Response(response)

    @detail_route(methods=['GET'])
    def resend_activation_email(self, request, pk=None):
        if pk:
            user = self.get_queryset().get(pk=pk)
            if not user.is_active:
                activation_url = request.build_absolute_uri(
                    reverse('api-activate')
                ) + '?activation_key='
                user.send_activation_email(request, activation_url)

        return Response({})

    @list_route(methods=['POST'])
    def register(self, request):
        serializer = APIRegisterSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        with atomic():
            kwargs = dict()
            if request.data.get('title', None):
                kwargs['title'] = request.data['title']
            if request.data.get('position', None):
                kwargs['position'] = request.data['position']
            if request.data.get('phone_number', None):
                kwargs['phone_number'] = request.data['phone_number']
            user = get_user_model().objects.create_user(
                name=request.data['name'],
                surname=request.data['surname'],
                email=request.data['email'],
                language=request.data.get('language', None),
                is_active=False,
                **kwargs
            )
            if request.data.get('groups', None):
                user.groups = [Group.objects.get(
                    name=group['name']) for group in request.data['groups']]
                user.save()
            token, created = Token.objects.get_or_create(user=user)
            activation_url = request.build_absolute_uri(
                reverse('api-activate')) + '?activation_key='
            user.send_activation_email(request, activation_url)

        return Response(serializers_v2.UserWithGroupSerializer(user, context={'request': request}).data)

    @list_route(methods=['GET'])
    @authentication_classes([])
    @permission_classes([])
    def logout(self, request):
        user = request.user
        token, created = Token.objects.get_or_create(user=user)
        token.delete()

        logout(request)

        return Response({})

    @list_route(methods=['POST'])
    def reset_password(self, request):
        serializer = EmailSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = request.data['email']
        user = get_user_model().objects.get(email=email)
        site = get_current_site(request)
        base_url = request.data['base_url']
        user.send_password_reset_email(base_url, site)
        return Response({})

    @list_route(methods=['POST'])
    def reset_password_confirm(self, request):
        serializer = SecurePasswordCredentialsSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        return Response({'userId': serializer.validated_data['user_id']})

    @list_route(methods=['POST'])
    def reset_password_done(self, request):
        serializer = ResetUserPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = EmailUser.objects.get(pk=serializer.data['id'])
        user.set_password(serializer.data['new_password1'])
        user.save()
        return Response({})

    def partial_update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', True)
        instance = self.get_object()
        if request.user.is_superuser or instance == request.user:
            serializer = UserAvatarSerializer(
                instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response({'status': 204, 'avatar': settings.MEDIA_URL + str(instance.avatar.name)})
        return Response(status=403)

    def update(self, request, *args, **kwargs):
        # Don't allow users to change their email
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        if request.user.is_superuser or instance == request.user:
            serializer = self.get_serializer(
                instance, data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            self.perform_update(serializer)
            return Response(serializer.data)
        return Response(status=403)


class GeographicRegionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.DjangoModelPermissionsOrAnonReadOnly]
    queryset = GeographicRegion.objects.select_related('parent').all()
    serializer_class = serializers_v2.GeographicRegionSerializer
    pagination_class = StandardResultsSetPagination
    filter_class = GeographicRegionFilter
    search_fields = ['name'] + generate_translated_fields('title', False)

    def get_serializer_class(self):
        if getattr(self, 'action') == 'create':
            return serializers_v2.GeographicRegionCreateSerializer    
        if ('exclude_geometry' in self.request.GET or 'countries' in self.request.GET):
            return serializers_v2.GeographicRegionSerializerNoGeometry
        else:
            return serializers_v2.GeographicRegionSerializer

    def get_queryset(self):
        qs = super(GeographicRegionViewSet, self).get_queryset()
        if 'countries' in self.request.GET:
            qs = qs.filter(Q(level=1) & Q(hidden=False))
        if (hasattr(self.request, 'parent')):
            qs = qs.filter(Q(parent=self.request.parent) |
                           Q(parent__parent=self.request.parent))

        return qs

    def update(self, request, *args, **kwargs):
        instance = self.get_object()
        # serializer with geom for return only
        serializerReturn = self.get_serializer(instance, data=request.data, partial=True)
        serializerReturn.is_valid(raise_exception=True)        
        data = serializerReturn.data

        geom = instance.geom.ewkt.split(";")[1]
        geomobj = instance.geom
        instance.geom = None
        request.data.pop('geom')
        region = kwargs.pop('pk')
        # serializer without geom objet to save
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        TypesOrdering.objects.filter(region=region).delete()
        types_ordering = request.data['types_ordering']
        for i, obj in enumerate(types_ordering):
            t = TypesOrdering(ordering=i, region_id=region, service_type_id=obj['id'])
            t.save()

        self.perform_update(serializer)
        cursor = connections['default'].cursor()
        cursor.execute("update regions_geographicregion set geom = ST_GEOMFROMTEXT(%s, 4326) where id = %s ;", [geom, region])
        self.geom = geomobj
        return Response(data)
    
    # def list(self, request):
    #     t1 = time.time()
    #     key = 'regions'
    #     cached = cache.get(key)
    #     if not cached:
    #         queryset = self.filter_queryset(self.get_queryset())
    #         page = self.paginate_queryset(queryset)

    #         if page is not None:
    #             serializer = self.get_serializer(page, many=True)
    #             serializer.data[0]['paginated'] = True
    #         else:
    #             serializer = self.get_serializer(queryset, many=True)
    #             serializer.data[0]['paginated'] = False
    #             cache.set(key, serializer.data)
    #             print('SETting not paginated regions.list')

    #         cached = serializer.data
    #     else:
    #         print('GETting not paginated cached regions.list')

    #     t2 = time.time()
    #     print('time consumed: ', t2 - t1)

    #     if cached[0]['paginated']:
    #         print('paginated response')
    #         return self.get_paginated_response(cached)
    #     else:
    #         print('not paginated response')
    #         return Response(cached)
        
    #     # return Response(cached) if cached[0]['paginated'] is not True else self.get_paginated_response(cached)

    # @receiver(post_save, sender=GeographicRegion)
    # def invalidate_cache(sender, **kwargs):
    #     cache.delete('regions')
    #     print('invalidating regions')

class UserPermissionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = EmailUser.objects.all()
    serializer_class = serializers_v2.UserPermissionSerializer
    http_method_names = ['get']

    def list(self, request, *args, **kwargs):
        queryset = EmailUser.objects.get(pk=request.user.pk)
        serializer = self.get_serializer(queryset, many=False)
        return Response(serializer.data)

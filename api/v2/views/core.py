import logging

from django.conf import settings
from django.contrib.auth.models import Group
from django.contrib.sites.shortcuts import get_current_site

from api.serializers import APILoginSerializer, APIRegisterSerializer
from api.v2 import serializers as serializers_v2
from django.contrib.auth import get_user_model, login
from django.db.transaction import atomic
from django.urls import reverse
from django.utils.timezone import now
from rest_framework.permissions import AllowAny, IsAuthenticated, IsAuthenticatedOrReadOnly

from api.v2.serializers import UserAvatarSerializer, EmailSerializer, SecurePasswordCredentialsSerializer, \
    ResetUserPasswordSerializer, GroupSerializer
from email_user.models import EmailUser
from regions.models import GeographicRegion
from rest_framework import permissions
from rest_framework import viewsets, mixins
from rest_framework.authtoken.models import Token
from rest_framework.decorators import list_route
from rest_framework.response import Response
from .utils import IsSuperUserPermission, StandardResultsSetPagination
from ..filters import GeographicRegionFilter

logger = logging.getLogger(__name__)


class GroupViewSet(viewsets.ModelViewSet):
    """
    API endpoint that allows groups to be viewed or edited.
    """
    queryset = Group.objects.all()
    serializer_class = GroupSerializer
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
        return super().get_serializer_class()

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
                password=request.data['password'],
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

        return Response({})

    @list_route(methods=['GET'])
    def logout(self, request):
        user = request.user
        token, created = Token.objects.get_or_create(user=user)
        token.delete()

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

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        if request.user.is_superuser or instance == request.user:
            serializer = self.get_serializer(instance)
            user = serializer.data
            return Response({'email': user['email'],
                             'isStaff': user['is_staff'],
                             'isSuperuser': user['is_superuser'],
                             'name': user['name'],
                             'surname': user['surname'],
                             'id': user['id'],
                             'title': user['title'],
                             'position': user['position'],
                             'groups': user['groups'],
                             'phone_number': user['phone_number']})
        return Response(status=403)


class GeographicRegionViewSet(viewsets.ModelViewSet):
    permission_classes = [permissions.DjangoModelPermissionsOrAnonReadOnly]
    queryset = GeographicRegion.objects.select_related('parent').all()
    serializer_class = serializers_v2.GeographicRegionSerializer
    pagination_class = StandardResultsSetPagination
    filter_class = GeographicRegionFilter

    def get_serializer_class(self):
        if 'exclude_geometry' in self.request.GET:
            return serializers_v2.GeographicRegionSerializerNoGeometry
        else:
            return serializers_v2.GeographicRegionSerializer


class UserPermissionViewSet(viewsets.ReadOnlyModelViewSet):
    permission_classes = [IsAuthenticated]
    queryset = EmailUser.objects.all()
    serializer_class = serializers_v2.UserPermissionSerializer
    http_method_names = ['get']

    def list(self, request, *args, **kwargs):
        queryset = EmailUser.objects.get(pk=request.user.pk)
        serializer = self.get_serializer(queryset, many=False)
        return Response(serializer.data)

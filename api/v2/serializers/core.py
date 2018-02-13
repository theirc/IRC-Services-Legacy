import json

from django.http import Http404
from django.utils.encoding import force_text
from django.utils.http import urlsafe_base64_decode
from rest_framework.generics import get_object_or_404
from django.contrib.auth.models import Group

import regions.models
from api.serializers import GroupSerializer
from api.utils import generate_translated_fields
from collections import OrderedDict
from django.conf import settings
from email_user.models import EmailUser, token_generator
from regions.models import GeographicRegion
from rest_framework import exceptions, serializers
from services.models import Service, Provider, ServiceArea
from . import apps as apps_serializers

CAN_EDIT_STATUSES = [Service.STATUS_DRAFT, Service.STATUS_CURRENT, Service.STATUS_REJECTED]
DRFValidationError = exceptions.ValidationError


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'id', 'name')


class RequireOneTranslationMixin(object):
    """Validate that for each set of fields with prefix
    in `Meta.required_translated_fields` and ending in _en, _ar, _fr,
    that at least one value is provided."""

    # Override run_validation so we can get in at the beginning
    # of validation for a call and add our own errors to those
    # the other validations find.
    def run_validation(self, data=serializers.empty):
        # data is a dictionary
        errs = defaultdict(list)
        for field in self.Meta.required_translated_fields:
            if not any(data.get(key, False) for key in generate_translated_fields(field, False)):
                errs[field].append(_('This field is required.'))
        try:
            validated_data = super().run_validation(data)
        except (exceptions.ValidationError, DjangoValidationError) as exc:
            errs.update(serializers.get_validation_error_detail(exc))
        if errs:
            raise exceptions.ValidationError(errs)
        return validated_data


class ServiceAreaSerializer(RequireOneTranslationMixin,
                            serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ServiceArea
        fields = tuple(
            [
                'id',
                'parent',
                'url'
            ] + generate_translated_fields('name')
        )
        required_translated_fields = ['name']

class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailUser
        fields = ('id', 'email', 'groups', 'name', 'surname', 'is_staff', 'is_superuser', 'phone_number', 'title',
                  'position')


class UserWithGroupSerializer(serializers.ModelSerializer):
    groups = GroupSerializer(many=True)

    class Meta:
        model = EmailUser
        fields = ('id', 'email', 'groups', 'name', 'surname', 'is_staff', 'is_superuser', 'phone_number', 'title',
                  'position')


class UserAvatarSerializer(serializers.ModelSerializer):
    avatar = serializers.ImageField(allow_null=True)

    def validate(self, attrs):
        avatar = attrs['avatar']
        if avatar and avatar._size >= settings.MAX_UPLOAD_SIZE:
            raise DRFValidationError('File is too large. Max 2.5 MB.')
        return attrs

    class Meta:
        model = EmailUser
        fields = ('avatar',)


class EmailSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate(self, attrs):
        try:
            get_object_or_404(EmailUser, email=attrs['email'])
            return attrs
        except Http404:
            raise DRFValidationError('The e-mail address is not assigned to any user account.')


class SecurePasswordCredentialsSerializer(serializers.Serializer):
    uidb64 = serializers.RegexField(regex='[0-9A-Za-z_\-]+')
    token = serializers.RegexField(regex='[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20}')

    def validate(self, attrs):
        token = attrs['token']
        try:
            uid = force_text(urlsafe_base64_decode(attrs['uidb64']))
            user = EmailUser.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, EmailUser.DoesNotExist):
            raise DRFValidationError('Bad reset link.')

        if user is not None and token_generator.check_token(user, token):
            attrs['user_id'] = user.id
            return attrs
        raise DRFValidationError('Bad reset link.')


class ResetUserPasswordSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    new_password1 = serializers.CharField()
    new_password2 = serializers.CharField()
    user = None

    def validate(self, attrs):
        try:
            self.user = get_object_or_404(EmailUser, pk=attrs['id'])
            if attrs['new_password1'] != attrs['new_password2']:
                raise DRFValidationError("The two password fields didn't match.")
        except Http404:
            raise DRFValidationError('Invalid user.')

        return attrs


class ProviderSerializer(serializers.ModelSerializer):
    number_of_monthly_beneficiaries = serializers.IntegerField(
        min_value=0, max_value=1000000,
        required=False,
        allow_null=True
    )

    class Meta:
        model = Provider
        fields = tuple(
            [
                'url', 'id',
            ] +
            generate_translated_fields('name') +
            generate_translated_fields('description') +
            generate_translated_fields('focal_point_name') +
            generate_translated_fields('address') +
            [
                'type', 'phone_number', 'website',
                'focal_point_phone_number',
                'user', 'number_of_monthly_beneficiaries'
            ]
        )
        required_translated_fields = ['name', 'description', 'focal_point_name', 'address']


class ServiceExcelSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField(read_only=True)
    region = serializers.RelatedField(read_only=True)

    def get_location(self, obj):
        return ",".join([str(obj.location.y), str(obj.location.x)]) if obj.location else ''

    FIELD_MAP = OrderedDict(
        [
            ('id', 'Identifier'),
            ('region', 'Region of Service'),
            ('location', 'Coordinates'),
            ('type', 'Type of Service'),
            ('phone_number', 'Phone Number'),
        ] +
        [("name_{}".format(k), "Name in ({})".format(v)) for k, v in settings.LANGUAGES] +
        [("description_{}".format(k), "Description in ({})".format(v)) for k, v in settings.LANGUAGES] +
        [("address_{}".format(k), "Address in ({})".format(v)) for k, v in settings.LANGUAGES] +
        [
            ('sunday_open', 'Sunday Opening Hours (00:00:00)'),
            ('sunday_close', 'Sunday Closing Hours (00:00:00)'),
            ('monday_open', 'Monday Opening Hours (00:00:00)'),
            ('monday_close', 'Monday Closing Hours (00:00:00)'),
            ('tuesday_open', 'Tuesday Opening Hours (00:00:00)'),
            ('tuesday_close', 'Tuesday Closing Hours (00:00:00)'),
            ('wednesday_open', 'Wednesday Opening Hours (00:00:00)'),
            ('wednesday_close', 'Wednesday Closing Hours (00:00:00)'),
            ('thursday_open', 'Thursday Opening Hours (00:00:00)'),
            ('thursday_close', 'Thursday Closing Hours (00:00:00)'),
            ('friday_open', 'Friday Opening Hours (00:00:00)'),
            ('friday_close', 'Friday Closing Hours (00:00:00)'),
            ('saturday_open', 'Saturday Opening Hours (00:00:00)'),
            ('saturday_close', 'Sunday Closing Hours (00:00:00)'),
        ])

    class Meta:
        model = Service
        fields = (
            [
                'id',
                'region',
                'location',
                'sunday_open',
                'sunday_close',
                'monday_open',
                'monday_close',
                'tuesday_open',
                'tuesday_close',
                'wednesday_open',
                'wednesday_close',
                'thursday_open',
                'thursday_close',
                'friday_open',
                'friday_close',
                'saturday_open',
                'saturday_close',
                'type',
                'phone_number',
            ] + generate_translated_fields('name') +
            generate_translated_fields('description') +
            generate_translated_fields('address') +
            generate_translated_fields('additional_info') +
            generate_translated_fields('languages_spoken')
        )


class GeographicRegionSerializer(serializers.ModelSerializer):
    parent__name = serializers.SerializerMethodField(read_only=True)
    centroid = serializers.SerializerMethodField(read_only=True)
    envelope = serializers.SerializerMethodField(read_only=True)

    def get_centroid(self, obj):
        return json.loads(obj.centroid.json)

    def get_envelope(self, obj):
        return json.loads(obj.geom.envelope.json)

    def get_parent__name(self, obj):
        return obj.parent.name if obj.parent else ''
    class Meta:
        model = GeographicRegion
        fields = tuple(
            ['id', 'name', 'slug', 'code', 'hidden', 'level', 'geom', 'centroid', 'envelope', 'parent',
             'parent__name'] +
            generate_translated_fields('title')
        )


class GeographicRegionSerializerNoGeometry(serializers.ModelSerializer):
    parent__name = serializers.SerializerMethodField(read_only=True)
    centroid = serializers.SerializerMethodField(read_only=True)
    envelope = serializers.SerializerMethodField(read_only=True)

    def get_centroid(self, obj):
        return json.loads(obj.centroid.json)

    def get_envelope(self, obj):
        return json.loads(obj.geom.envelope.json)

    def get_parent__name(self, obj):
        return obj.parent.name if obj.parent else ''

    class Meta:
        model = GeographicRegion
        fields = tuple(
            ['id', 'name', 'slug', 'code', 'hidden', 'level', 'centroid', 'envelope', 'parent',
             'parent__name'] +
            generate_translated_fields('title')
        )

class UserPermissionSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField(required=False)

    def get_permissions(self, obj):
        return obj.get_all_permissions()

    class Meta:
        model = EmailUser
        fields = ('email', 'permissions')
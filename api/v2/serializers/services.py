import json
from datetime import datetime

from PIL import Image
from django.core.files.uploadedfile import InMemoryUploadedFile
from django.utils.six import BytesIO

from admin_panel.utils import get_service_transifex_info
from api.utils import generate_translated_fields
from collections import OrderedDict
from django.conf import settings
from rest_framework import exceptions, serializers

from regions.models import GeographicRegion
from services.models import Service, Provider, ServiceType, SelectionCriterion, ServiceTag, ProviderType, \
    ServiceConfirmationLog

CAN_EDIT_STATUSES = [Service.STATUS_DRAFT, Service.STATUS_CURRENT, Service.STATUS_REJECTED]
DRFValidationError = exceptions.ValidationError


def resize_image(file_path):
    image = Image.open(file_path)
    file_format = image.format

    if hasattr(settings, 'MAX_IMAGE_RESOLUTION'):
        max_resolution = settings.MAX_IMAGE_RESOLUTION
    else:
        max_resolution = (image.width, image.height)
    image.thumbnail(max_resolution, Image.ANTIALIAS)
    thumbnail_io = BytesIO()
    image.save(thumbnail_io, format=file_format, optimize=True, quality=70)

    scaled_file = InMemoryUploadedFile(
        thumbnail_io,
        None,
        file_path.name,
        file_format,
        len(thumbnail_io.getvalue()),
        None)
    scaled_file.seek(0)

    return scaled_file


class ServiceImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(allow_null=True)

    def validate_image(self, data):
        if data and data._size >= settings.MAX_UPLOAD_SIZE:
            raise DRFValidationError('File is too large. Max 2.5 MB.')
        elif data:
            return resize_image(data)
        else:
            return data

    class Meta:
        model = Service
        fields = ('image',)


class DistanceField(serializers.FloatField):
    # 'distance' isn't really a field on the model, but search
    # results querysets will have added it if the results were
    # ordered by distance. Otherwise, just use the default.
    def get_attribute(self, obj):
        if getattr(obj, 'distance', None) is not None:
            return obj.distance.m  # Distance in meters
        return self.default


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
                'user', 'number_of_monthly_beneficiaries', 'region'
            ]
        )
        required_translated_fields = ['name', 'description', 'focal_point_name', 'address']


class RegionSerializer(serializers.ModelSerializer):

    class Meta:
        model = GeographicRegion
        fields = tuple(
            [
                'id',
                'name',
                'slug',
                'level',
                'code',
                'hidden'
            ] +
            generate_translated_fields('title')
        )


class ServiceTagSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceTag
        fields = ['id', 'name']


class ServiceExcelSerializer(serializers.ModelSerializer):
    location = serializers.SerializerMethodField(read_only=True)

    def get_location(self, obj):
        return ",".join([str(obj.location.y), str(obj.location.x)]) if obj.location else ''

    def validate(self, attrs):
        return super().validate(attrs)

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
            ('opening_time', 'Opening time')
        ])

    class Meta:
        model = Service
        fields = (
            [
                'id',
                'region',
                'location',
                'opening_time',
                'type',
                'phone_number',
            ] + generate_translated_fields('name') +
            generate_translated_fields('description') +
            generate_translated_fields('address') +
            generate_translated_fields('additional_info') +
            generate_translated_fields('languages_spoken')
        )


class ServiceTypeSerializer(serializers.ModelSerializer):
    icon_url = serializers.CharField(source='get_icon_url', read_only=True)
    icon_base64 = serializers.CharField(source='get_icon_base64', read_only=True)

    class Meta:
        model = ServiceType
        fields = tuple(
            [
                'id',
                'icon_url',
                'vector_icon',
                'number',
                'icon_base64',
                'color',
            ] +
            generate_translated_fields('name') +
            generate_translated_fields('comments')
        )
        required_translated_fields = ['name']

    def update(self, instance, validated_data):
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()

        for idx, service_type in enumerate(self.initial_data['types_ordering']):
            ServiceType.objects.update_or_create(id=service_type['id'], defaults={'number': idx + 1})
        return instance


class ServiceSerializer(serializers.ModelSerializer):
    provider_fetch_url = serializers.CharField(source='get_provider_fetch_url', read_only=True)
    provider = ProviderSerializer(read_only=False)
    image = serializers.SerializerMethodField()
    region = RegionSerializer(read_only=False)
    tags = ServiceTagSerializer(many=True)
    opening_time = serializers.SerializerMethodField()
    types = ServiceTypeSerializer(many=True)

    class Meta:
        model = Service
        fields = tuple(
            [
                'url', 'id',
                'slug',
                'region',
                'cost_of_service',
                'selection_criteria',
                'status', 'update_of',
                'location',
                'provider',
                'provider_fetch_url',
                'sunday_open', 'sunday_close',
                'monday_open', 'monday_close',
                'tuesday_open', 'tuesday_close',
                'wednesday_open', 'wednesday_close',
                'thursday_open', 'thursday_close',
                'friday_open', 'friday_close',
                'saturday_open', 'saturday_close',
                'type',
                'types',
                'is_mobile',
                'image',
                'phone_number',
                'updated_at',
                'address_in_country_language',
                'tags',
                'email',
                'website',
                'facebook_page',
                'opening_time',
                'focal_point_first_name',
                'focal_point_last_name',
                'focal_point_email',
                'second_focal_point_email',
                'second_focal_point_first_name',
                'second_focal_point_last_name',
                'exclude_from_confirmation'
            ] +
            generate_translated_fields('name') +
            generate_translated_fields('address_city') +
            generate_translated_fields('address') +
            generate_translated_fields('address_floor') +
            generate_translated_fields('description') +
            generate_translated_fields('additional_info') +
            generate_translated_fields('languages_spoken')
        )
        required_translated_fields = ['name', 'description']

    def update(self, instance, validated_data):
        tags = validated_data.pop('tags')
        types = validated_data.pop('types')
        validated_data['region'] = GeographicRegion.objects.get(id=self.initial_data['region']['id'])
        validated_data['provider'] = Provider.objects.get(id=self.initial_data['provider']['id'])
        opening_time = self.initial_data.get('opening_time')
        validated_data['opening_time'] = json.dumps(opening_time)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.tags = [ServiceTag.objects.get(name=tag['name']) for tag in tags]
        instance.types = [ServiceType.objects.get(name_en=service_type['name_en']) for service_type in types]
        # backwards compatibility for mobile app
        instance.type = ServiceType.objects.get(name_en=types[0]['name_en'])
        instance.save()
        if self.initial_data.get('confirmedByAdmin'):
            last_log = ServiceConfirmationLog.objects.filter(service=instance).order_by('-date')
            log = ServiceConfirmationLog.objects.create(service=instance,
                                                        status=ServiceConfirmationLog.CONFIRMED,
                                                        note="Confirmed by ADMIN",
                                                        sent_to='-')
        return instance

    def get_image(self, obj):
        try:
            if obj.image:
                return obj.image.url
        except Exception as e:
            pass
        return None

    def get_image_data(self, obj):
        from requests import get
        import mimetypes
        import base64
        try:
            url = obj.image.url
            image = get(url).content
            mime, a = mimetypes.guess_type(url)
            b64data = base64.b64encode(image)

            return "data:{};base64,{}".format(mime, b64data.decode("ascii"))
        except:
            return ""

    def get_rating(self, obj):
        return obj.get_rating()

    def get_opening_time(self, obj):
        return json.loads(obj.opening_time) if obj.opening_time else {}


class ServiceManagementSerializer(serializers.ModelSerializer):
    transifex_status = serializers.SerializerMethodField()
    tags = ServiceTagSerializer(many=True)
    types = ServiceTypeSerializer(many=True)

    class Meta:
        model = Service
        fields = tuple(
            [
                'id',
                'slug',
                'url',
                'name',
                'name_en',
                'region',
                'status',
                'location',
                'provider',
                'type',
                'types',
                'updated_at',
                'transifex_status',
                'tags',
                'email',
                'website',
                'facebook_page'
            ]
        )

    def get_transifex_status(self, obj):
        r = get_service_transifex_info(obj.id)
        try:
            transifex_text = json.loads(r.text)
            languages = [i[0] for i in settings.LANGUAGES_CMS]
            output = dict((k, v['completed']) for k, v in transifex_text.items() if k in languages)
        except ValueError:
            if r.status_code == 404:
                output = {
                    'errors': 'Service has not been sent to Transifex yet.'
                }
            else:
                output = {
                    'errors': 'An error occurred from Transifex (%s).' % r.text
                }
        return output


class ProviderTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProviderType
        fields = tuple(
            [
                'id',
            ] + generate_translated_fields('name')
        )


class CustomServiceTypeSerializer(serializers.ModelSerializer):
    """Serializer for distincted service types"""
    types = ServiceTypeSerializer(many=True)

    class Meta:
        model = ServiceType
        fields = ['types']


class ServiceSearchSerializer(ServiceSerializer):
    """Serializer for service searches"""
    distance = DistanceField(default=0.0)

    class Meta(ServiceSerializer.Meta):
        # Include all fields except a few, and add in distance
        fields = tuple([field for field in ServiceSerializer.Meta.fields
                        if field not in ['status', 'update_of']]) + ('distance',)


class ServiceCreateSerializer(serializers.ModelSerializer):
    tags = ServiceTagSerializer(many=True)
    opening_time = serializers.SerializerMethodField()
    types = ServiceTypeSerializer(many=True)

    class Meta:
        model = Service
        fields = tuple(
            [
                'url', 'id',
                'region',
                'cost_of_service',
                'selection_criteria',
                'status', 'update_of',
                'location',
                'provider',
                'sunday_open', 'sunday_close',
                'monday_open', 'monday_close',
                'tuesday_open', 'tuesday_close',
                'wednesday_open', 'wednesday_close',
                'thursday_open', 'thursday_close',
                'friday_open', 'friday_close',
                'saturday_open', 'saturday_close',
                'type',
                'types',
                'is_mobile',
                'image',
                'phone_number',
                'updated_at',
                'address_in_country_language',
                'tags',
                'email',
                'website',
                'facebook_page',
                'opening_time',
                'focal_point_first_name',
                'focal_point_last_name',
                'focal_point_email',
                'second_focal_point_first_name',
                'second_focal_point_last_name',
                'second_focal_point_email'
            ] +
            generate_translated_fields('name') +
            generate_translated_fields('address_city') +
            generate_translated_fields('address') +
            generate_translated_fields('address_floor') +
            generate_translated_fields('description') +
            generate_translated_fields('additional_info') +
            generate_translated_fields('languages_spoken')
        )

    def create(self, validated_data):
        # Create selection criteria to go with the service
        criteria = validated_data.pop('selection_criteria', None)
        tags = validated_data.pop('tags', None)
        types = validated_data.pop('types')
        opening_time = self.initial_data.get('opening_time')
        validated_data['opening_time'] = json.dumps(opening_time)
        validated_data['created_at'] = datetime.now()
        services = Service.objects.filter(slug=self.initial_data.get('slug'))
        if len(services) > 0:
            new_slug = self.initial_data.get('slug')
            service = Service.objects.create(**validated_data)
            new_slug = new_slug + '_' + str(service.id)
            service.slug = new_slug
            service.save()
        else:
            validated_data['slug'] = self.initial_data.get('slug')
            service = Service.objects.create(**validated_data)
        if criteria:
            for kwargs in criteria:
                # Force criterion to link to the new service
                kwargs['service'] = service
                SelectionCriterion.objects.create(**kwargs)
        service.tags = [ServiceTag.objects.get(name=tag['name']) for tag in tags]
        service.types = [ServiceType.objects.get(name_en=service_type['name_en']) for service_type in types]
        # backwards compatibility for mobile app
        service.type = ServiceType.objects.get(name_en=types[0]['name_en'])
        service.save()
        if self.initial_data.get('confirmed'):
            log = ServiceConfirmationLog.objects.create(service=service,
                                                        status=ServiceConfirmationLog.CONFIRMED,
                                                        note="Confirmed by ADMIN",
                                                        sent_to='-')
        return service

    def get_opening_time(self, obj):
        return json.loads(obj.opening_time) if obj.opening_time else {}


class ConfirmationLogsSerializer(serializers.ModelSerializer):
    status = serializers.SerializerMethodField()

    class Meta:
        model = ServiceConfirmationLog
        fields = ('id', 'date', 'status', 'sent_to', 'note')

    def get_status(self, obj):
        for key, value in ServiceConfirmationLog.STATUSES:
            if key == obj.status:
                return value
        return obj.status


class ServiceConfirmationLogsSerializer(serializers.ModelSerializer):
    confirmation_logs = ConfirmationLogsSerializer(many=True)

    class Meta:
        model = Service
        fields = ('id', 'confirmation_logs')


class ServiceConfirmationLogListSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceConfirmationLog
        fields = '__all__'

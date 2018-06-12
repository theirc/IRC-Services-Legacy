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
    ServiceConfirmationLog, ContactInformation, UserNote

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



class ProviderSerializer(RequireOneTranslationMixin, serializers.HyperlinkedModelSerializer):
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
                'contact_name','title','type', 'phone_number', 'website',
                'focal_point_phone_number',
                'user', 'number_of_monthly_beneficiaries','is_frozen', 'service_types',
                'meta_population', 'record', 'requirement', 'vacancy', 'additional_info'
            ]
        )
        required_translated_fields = ['name', 'description', 'focal_point_name', 'address']
        extra_kwargs = {
            # Override how serializer comes up with the view name (URL name) for users,
            # because by default it'll base it on the model name from the user field,
            # which is 'email_user', and we're using 'user' as the base for our URL
            # name for users.
            'user': {'view_name': 'user-detail'}
        }



class CreateProviderSerializer(ProviderSerializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    base_activation_link = serializers.URLField()
    number_of_monthly_beneficiaries = serializers.IntegerField(
        min_value=0, max_value=1000000,
        required=False,
        allow_null=True
    )

    class Meta(ProviderSerializer.Meta):
        model = Provider
        fields = [field for field in ProviderSerializer.Meta.fields
                  if field not in ['user']]
        fields += ['email', 'password', 'base_activation_link']

    def run_validation(self, data=serializers.empty):
        # data is a dictionary
        errs = defaultdict(list)
        email = data.get('email', False)
        if email and get_user_model().objects.filter(email__iexact=email).exists():
            errs['email'].append(_("A user with that email already exists."))
        try:
            validated_data = super().run_validation(data)
        except (exceptions.ValidationError, DjangoValidationError) as exc:
            errs.update(serializers.get_validation_error_detail(exc))
        if errs:
            raise exceptions.ValidationError(errs)
        return validated_data

    def validate(self, attrs):
        attrs = super().validate(attrs)

        email = attrs.get('email')
        password = attrs.get('password')

        form = EmailUserCreationForm(data={
            'email': email,
            'password1': password,
            'password2': password,
        })
        if not form.is_valid():
            raise exceptions.ValidationError(form.errors)
        return attrs

class ContactInformationSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=False, allow_null=True) # Readonly fields like id do not get deserialized

    class Meta:
        model = ContactInformation
        fields  =('id', 'index', 'text', 'type')

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
                'contact_name','title','type', 'phone_number', 'website',
                'focal_point_phone_number',
                'user', 'number_of_monthly_beneficiaries', 'region','is_frozen', 'service_types',
                'meta_population', 'record', 'requirement', 'vacancy', 'additional_info'
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

class UserNoteSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=False, allow_null=True) 

    class Meta:
        model = UserNote


class ServiceSerializer(serializers.ModelSerializer):
    provider_fetch_url = serializers.CharField(source='get_provider_fetch_url', read_only=True)
    provider = ProviderSerializer(read_only=False)
    image = serializers.SerializerMethodField()
    region = RegionSerializer(read_only=False)
    tags = ServiceTagSerializer(many=True)
    opening_time = serializers.SerializerMethodField()
    types = ServiceTypeSerializer(many=True)
    contact_information = ContactInformationSerializer(many=True)

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
                'exclude_from_confirmation',
                'contact_information'
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
        contact_information = validated_data.pop('contact_information') if 'contact_information' in validated_data else []

        # Separate the objects to be updated and to be created
        to_update = [c for c in contact_information if c['id']]
        to_create = [c for c in contact_information if not c['id']]

        # Delete all records that are not in the list
        ContactInformation.objects.filter(service=instance).exclude(id__in=[c['id'] for c in to_update]).delete()

        # Go through updates, deserializes them, saves the changes
        for obj, update in [(ContactInformation.objects.get(id=c['id']), c) for c in to_update]:
            contact = ContactInformationSerializer(obj,data=update)
            if contact.is_valid():
                contact.save()

        # Create the new ones
        for contact in to_create:
            ContactInformation.objects.create(service=instance, **contact)

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
            ] + generate_translated_fields('name')
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
    contact_information = ContactInformationSerializer(many=True, required=False)

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
                'second_focal_point_email',
                'contact_information'
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
        contact_information = validated_data.pop('contact_information') if 'contact_information' in validated_data else []
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

        
        for contact in contact_information:
            ContactInformation.objects.create(service=service, **contact)

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



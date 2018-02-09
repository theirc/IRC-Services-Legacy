import json

from api.utils import generate_translated_fields
from collections import defaultdict
from django.conf import settings
from django.contrib.auth import authenticate, get_user_model
from django.contrib.auth.models import Group
from django.core.exceptions import ValidationError as DjangoValidationError, ObjectDoesNotExist
from django.core.validators import MinValueValidator, MaxValueValidator
from django.db.models import Count, Max
from django.utils.encoding import force_text
from django.utils.translation import override
from email_user.forms import EmailUserCreationForm
from email_user.models import EmailUser
from parler_rest.fields import TranslatedFieldsField
from parler_rest.serializers import TranslatableModelSerializer
from regions.models import GeographicRegion, ImportantInformation
from rest_framework import exceptions, serializers
from rest_framework.utils import model_meta
from rest_framework_recursive.fields import RecursiveField
from reversion.models import Version
from services.import_export import validate_and_import_data
from services.models import Service, Provider, ProviderType, ServiceType, ServiceArea, \
    SelectionCriterion, Feedback, Nationality, RequestForService

CAN_EDIT_STATUSES = [Service.STATUS_DRAFT, Service.STATUS_CURRENT, Service.STATUS_REJECTED]
DRFValidationError = exceptions.ValidationError
from django.utils.translation import ugettext_lazy as _

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


class UserSerializer(serializers.HyperlinkedModelSerializer):
    url = serializers.HyperlinkedIdentityField(
        view_name='user-detail',
        lookup_field='pk'
    )

    class Meta:
        model = EmailUser
        fields = ('url', 'id', 'email', 'groups')


class FeedbackSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Feedback
        fields = ('id', 'name', 'phone_number', 'nationality', 'area_of_residence',
                  'service', 'delivered', 'quality', 'non_delivery_explained',
                  'wait_time', 'wait_time_satisfaction', 'difficulty_contacting',
                  'other_difficulties', 'staff_satisfaction', 'extra_comments',
                  'anonymous')

    def validate(self, attrs):
        # Staff sat required if service delivered
        if attrs['delivered'] and not attrs.get('staff_satisfaction', False):
            raise exceptions.ValidationError(
                _("Staff satisfaction is required if service was delivered.")
            )
        return attrs


class LanguageSerializer(serializers.Serializer):
    language = serializers.CharField(max_length=10)

    def validate_language(self, value):
        # See if it's a valid language code
        language_dict = dict(settings.FRONTEND_LANGUAGES)
        if value not in language_dict:
            valid_codes = ', '.join(language_dict.keys())
            raise exceptions.ValidationError(
                _("Invalid language code {code}. The valid codes are {valid_codes}.").format(
                    code=value, valid_codes=valid_codes
                ))
        return value


class GroupSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Group
        fields = ('url', 'id', 'name')


class ProviderTypeSerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = ProviderType
        fields = tuple(
            [
                'url', 'id',
            ] + generate_translated_fields('name')
        )


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
                'type', 'phone_number', 'website',
                'focal_point_phone_number',
                'user', 'number_of_monthly_beneficiaries'
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


class ProviderFetchSerializer(RequireOneTranslationMixin, serializers.HyperlinkedModelSerializer):
    """
    Returns public data only
    """

    class Meta:
        model = Provider
        fields = tuple(
            [
                'url', 'id',
            ] +
            generate_translated_fields('name') +
            generate_translated_fields('description') +
            generate_translated_fields('address') +
            [
                'type', 'phone_number', 'website',
            ]
        )
        required_translated_fields = ['name', 'description', 'address']


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


class ServiceTypeSerializer(RequireOneTranslationMixin, serializers.HyperlinkedModelSerializer):
    icon_url = serializers.CharField(source='get_icon_url', read_only=True)
    icon_base64 = serializers.CharField(source='get_icon_base64', read_only=True)

    class Meta:
        model = ServiceType
        fields = tuple(
            [
                'url',
                'icon_url',
                'vector_icon',
                'number',
                'icon_base64',
            ] +
            generate_translated_fields('name') +
            generate_translated_fields('comments')
        )
        required_translated_fields = ['name']


class SelectionCriterionSerializer(RequireOneTranslationMixin,
                                   serializers.HyperlinkedModelSerializer):
    class Meta:
        model = SelectionCriterion
        fields = tuple(['url', 'id', 'service'] + generate_translated_fields('text'))
        required_translated_fields = ['text']


class SelectionCriterionSerializerForService(SelectionCriterionSerializer):
    # Serializer to use when nesting criteria data in a service
    # Remove 'service' from the required fields
    class Meta(SelectionCriterionSerializer.Meta):
        fields = [name for name in SelectionCriterionSerializer.Meta.fields if name != 'service']


class RequestForServiceSerializer(serializers.HyperlinkedModelSerializer):
    # These are text fields, if they have a trailing newline leave it alone.
    address = serializers.CharField(trim_whitespace=False)
    contact = serializers.CharField(trim_whitespace=False)
    description = serializers.CharField(trim_whitespace=False)

    class Meta:
        model = RequestForService
        fields = ['provider_name', 'service_name', 'region', 'service_type',
                  'address', 'contact', 'description', 'rating']


class ServiceSerializer(RequireOneTranslationMixin,
                        serializers.HyperlinkedModelSerializer):
    provider_fetch_url = serializers.CharField(source='get_provider_fetch_url', read_only=True)
    selection_criteria = SelectionCriterionSerializerForService(many=True, required=False)
    provider = ProviderSerializer(read_only=True)
    image = serializers.SerializerMethodField()

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
                'provider_fetch_url',
                'sunday_open', 'sunday_close',
                'monday_open', 'monday_close',
                'tuesday_open', 'tuesday_close',
                'wednesday_open', 'wednesday_close',
                'thursday_open', 'thursday_close',
                'friday_open', 'friday_close',
                'saturday_open', 'saturday_close',
                'type',
                'is_mobile',
                'image',
                'phone_number',
                'updated_at'
            ] +
            generate_translated_fields('name') +
            generate_translated_fields('address') +
            generate_translated_fields('description') +
            generate_translated_fields('additional_info') +
            generate_translated_fields('languages_spoken')
        )
        required_translated_fields = ['name', 'description']

    def validate(self, attrs):
        # Look for "new" services that are updates of existing ones
        # and do special things with them.
        attrs = super().validate(attrs)
        # User must be a provider
        if not Provider.objects.filter(user=self.context['request'].user).exists():
            raise exceptions.ValidationError(
                _('User is not a provider.  Only providers can create services.'))
        # We don't allow service updates via the API, and all new services should
        # start with draft status, so just force it.
        attrs['status'] = Service.STATUS_DRAFT
        if attrs.get('update_of', False):
            parent = attrs['update_of']
            if parent.status not in CAN_EDIT_STATUSES:
                raise exceptions.ValidationError(
                    {'update_of': _("You may only submit updates to current, draft or rejected"
                                    " services")}
                )
            if parent.status == Service.STATUS_CURRENT:
                drafts = parent.updates.filter(status=Service.STATUS_DRAFT)
                if drafts.exists():
                    raise exceptions.ValidationError(
                        {'update_of': _("There is already a pending draft update to this service.")}
                    )

        errs = defaultdict(list)
        for day in ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday',
                    'friday', 'saturday']:
            open_field, close_field = '%s_open' % day, '%s_close' % day
            open_value = attrs.get(open_field, None)
            close_value = attrs.get(close_field, None)
            if open_value is not None and close_value is None:
                errs[close_field].append(_('Close time is missing.'))
            elif close_value is not None and open_value is None:
                errs[open_field].append(_('Open time is missing.'))
            elif open_value is not None and close_value is not None and open_value >= close_value:
                errs[close_field].append(_('Close time is not later than open time.'))
        if errs:
            raise exceptions.ValidationError(errs)
        return attrs

    def create(self, validated_data):
        # Force the value of the provider to be that of the user who's
        # creating or modifying the record
        user = self.context['request'].user
        validated_data['provider'] = Provider.objects.get(user=user)

        # Create selection criteria to go with the service
        criteria = validated_data.pop('selection_criteria', None)
        service = Service.objects.create(**validated_data)
        if criteria:
            for kwargs in criteria:
                # Force criterion to link to the new service
                kwargs['service'] = service
                SelectionCriterion.objects.create(**kwargs)
        return service

    def update(self, instance, validated_data):
        user = self.context['request'].user
        validated_data['provider'] = Provider.objects.get(user=user)
        validated_data.pop('selection_criteria')
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance

    def save(self, **kwargs):
        # Force the value of the provider to be that of the user who's
        # creating or modifying the record
        user = self.context['request'].user
        kwargs['provider'] = Provider.objects.get(user=user)
        super().save(**kwargs)

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


class DistanceField(serializers.FloatField):
    # 'distance' isn't really a field on the model, but search
    # results querysets will have added it if the results were
    # ordered by distance. Otherwise, just use the default.
    def get_attribute(self, obj):
        if getattr(obj, 'distance', None) is not None:
            return obj.distance.m  # Distance in meters
        return self.default


class ServiceSearchSerializer(ServiceSerializer):
    """Serializer for service searches"""

    distance = DistanceField(default=0.0)

    class Meta(ServiceSerializer.Meta):
        # Include all fields except a few, and add in distance
        fields = tuple([field for field in ServiceSerializer.Meta.fields
                        if field not in ['status', 'update_of']]) + ('distance',)


class ServiceSimpleSerializer(RequireOneTranslationMixin,
                              serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Service
        fields = tuple(
            [
                'id',
                'location',
                'type',
                'name_en'
            ]
        )


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


class NationalitySerializer(serializers.HyperlinkedModelSerializer):
    class Meta:
        model = Nationality
        fields = tuple(
            [
                'url',
                'id',
            ] + generate_translated_fields('name')
        )


class GeographicRegionSerializerNoContent(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField(required=False, )
    languages_available = serializers.SerializerMethodField(required=False)
    content = serializers.SerializerMethodField(required=False)
    metadata = serializers.SerializerMethodField(required=False)
    envelope = serializers.SerializerMethodField(required=False)
    centroid = serializers.SerializerMethodField(required=False)

    important_information = serializers.SerializerMethodField(required=False)

    full_slug = serializers.CharField(required=False)

    def get_important_information(self, obj):
        return []

    def get_content(self, obj):
        return []

    def get_metadata(self, obj):
        return obj.metadata()

    def get_centroid(self, obj):
        return None

    def get_languages_available(self, obj):
        return []

    def get_envelope(self, obj):
        return json.loads(obj.geom.envelope.json)

    def get_distance(self, obj):
        return obj.distance.km if hasattr(obj, 'distance') else 0

    class Meta:
        model = GeographicRegion
        exclude = (
            'geom',
            'restrict_access_to',
        )


class GeographicRegionSerializerSimple(serializers.ModelSerializer):
    id = serializers.IntegerField(read_only=False)
    parent_name = serializers.SerializerMethodField()
    parent_slug = serializers.SerializerMethodField()

    def get_parent_name(self, obj):
        if obj.parent:
            if obj.parent.parent:
                return obj.parent.parent.name
            return obj.parent.name
        return

    def get_parent_slug(self, obj):
        if obj.parent:
            if obj.parent.parent:
                return obj.parent.parent.slug
            return obj.parent.slug
        return

    class Meta:
        model = GeographicRegion
        fields = ('level', 'name', 'id', 'parent_name', 'parent_slug', 'slug', 'code')


class GeographicRegionSerializer(serializers.ModelSerializer):
    distance = serializers.SerializerMethodField(required=False, )
    languages_available = serializers.SerializerMethodField(required=False)
    content = serializers.SerializerMethodField(required=False)
    metadata = serializers.SerializerMethodField(required=False)
    envelope = serializers.SerializerMethodField(required=False)
    centroid = serializers.SerializerMethodField(required=False)

    important_information = serializers.SerializerMethodField(required=False)

    full_slug = serializers.CharField(required=False)

    def get_environment(self):
        if 'request' in self.context and 'kwargs' in self.context['request'].parser_context:
            return self.context['request'].parser_context['kwargs'].get('environment', 'production')
        return 'production'

    def get_important_information(self, obj):
        return obj.get_sub_pages(environment=self.get_environment())

    def get_content(self, obj):
        return obj.get_sections(environment=self.get_environment())

    def get_metadata(self, obj):
        return obj.metadata(environment=self.get_environment())

    def get_centroid(self, obj):
        return json.loads(obj.centroid.json)

    def get_envelope(self, obj):
        return json.loads(obj.geom.envelope.json)

    def get_distance(self, obj):
        return obj.distance.km if hasattr(obj, 'distance') else 0

    def get_languages_available(self, obj):
        return obj.get_all_languages()

    class Meta:
        model = GeographicRegion
        exclude = (
            'geom',
            'restrict_access_to',
        )


class APILoginSerializer(serializers.Serializer):
    """
    Serializer for our "login" API.
    Both validates the call parameters and authenticates
    the user, returning the user in the validated_data
    if successful.

    Adapted from authtoken/serializers.py for our email-based user model
    """
    email = serializers.EmailField()
    password = serializers.CharField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        email = attrs.get('email')
        password = attrs.get('password')
        user = authenticate(email=email, password=password)

        if user:
            if not user.is_active:
                msg = _('User account is disabled.')
                raise exceptions.ValidationError(msg)
        else:
            msg = _('Unable to log in with provided credentials.')
            raise exceptions.ValidationError(msg)

        attrs['user'] = user
        return attrs


class APIActivationSerializer(serializers.Serializer):
    """
    Serializer for our "activate" API.

    Raises ValidationError if the call is invalid.
    """
    activation_key = serializers.CharField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        activation_key = attrs.get('activation_key')
        User = get_user_model()
        try:
            User.objects.get(activation_key=activation_key)
        except User.DoesNotExist:
            msg = _('Activation key is invalid. Check that it was copied correctly '
                    'and has not already been used.')
            raise exceptions.ValidationError({'activation_key': msg})
        return attrs


class APIRegisterSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()
    name = serializers.CharField()
    surname = serializers.CharField()
    title = serializers.CharField(required=False)
    position = serializers.CharField(required=False)
    phone_number = serializers.CharField(required=False)
    groups = serializers.PrimaryKeyRelatedField(many=True, required=False, read_only=True)

    def validate(self, attrs):
        attrs = super().validate(attrs)
        User = get_user_model()
        user = User.objects.filter(email=attrs.get('email'))
        if user:
            raise exceptions.ValidationError({'email': 'User with this email already exists'})
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for our API to request a password reset.

    Validates the email.
    """
    email = serializers.EmailField()
    base_reset_link = serializers.URLField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        User = get_user_model()
        try:
            attrs['user'] = User.objects.get(email__iexact=attrs.get('email'))
        except User.DoesNotExist:
            msg = _("No user with that email")
            raise exceptions.ValidationError({'email': msg})
        return attrs


class PasswordResetCheckSerializer(serializers.Serializer):
    """
    Serializer for our API to check if a password
    reset key appears to be valid.
    """
    key = serializers.CharField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        key = attrs.get('key')
        user = get_user_model().objects.validate_password_reset_key(key)
        if not user:
            msg = _("Password reset key is not valid")
            raise exceptions.ValidationError(msg)
        attrs['user'] = user
        return attrs


class PasswordResetSerializer(serializers.Serializer):
    """
    Serializer for our API to reset a password.
    """
    password = serializers.CharField()
    key = serializers.CharField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        key = attrs.get('key')
        user = get_user_model().objects.validate_password_reset_key(key)
        if not user:
            msg = _("Password reset key is not valid")
            raise exceptions.ValidationError(msg)
        attrs['user'] = user
        return attrs


class ResendActivationLinkSerializer(serializers.Serializer):
    email = serializers.EmailField()
    base_activation_link = serializers.URLField()

    def validate(self, attrs):
        attrs = super().validate(attrs)
        email = attrs.get('email')
        try:
            user = get_user_model().objects.get(email__iexact=email)
        except get_user_model().DoesNotExist:
            msg = _("No user with that email")
            raise exceptions.ValidationError({'email': msg})
        if not user.has_valid_activation_key():
            msg = _("User is not pending activation")
            raise exceptions.ValidationError({'email': msg})
        attrs['user'] = user
        return attrs


class ImportSerializer(serializers.Serializer):
    file = serializers.FileField(required=False)

    def validate(self, attrs):
        user = self.context['request'].user
        data = attrs['file'].read()
        errs = validate_and_import_data(user, data)
        if errs:
            raise DRFValidationError(errs)
        return attrs


class BaseServiceTypeAggregateSerializer(RequireOneTranslationMixin,
                                         serializers.HyperlinkedModelSerializer):
    """Common base class for service types aggregates."""

    totals = serializers.SerializerMethodField()

    aggregate_field = None

    class Meta:
        model = ServiceType
        fields = tuple([
                           'url',
                           'number',
                           'totals',
                       ] + generate_translated_fields('name')
                       )
        required_translated_fields = ['name']

    def get_totals(self, service_type):
        """
        Returns a list of items, one item per possible value of
        the aggregate field.

        Each item in the list is a dictionary with the following fields:

        * label_en: Label for one value, in English
        * label_ar: Label for that value, in Arabic
        * label_fr: label for that value, in French
        * total: number of Feedback records where the service_type is set to
           the service_type argument of this method, and the aggregate field
           has the value that the labels apply to.
        """
        if self.aggregate_field is None:
            raise ValueError('aggregate_field must be defined.')
        totals = []
        results = Feedback.objects.filter(service__type=service_type).values(
            self.aggregate_field).annotate(total=Count('id')).order_by()
        counts = {r[self.aggregate_field]: r['total'] for r in results}
        field = Feedback._meta.get_field(self.aggregate_field)
        choices = field.choices
        if not choices:
            # We don't have explicit choices; figure out the min & max values
            # from the validators
            for v in field.validators:
                if isinstance(v, MinValueValidator):
                    # SmallIntegers have validators for Min/Max small int, ignore those
                    if v.limit_value != -32768:
                        minimum = v.limit_value
                elif isinstance(v, MaxValueValidator):
                    if v.limit_value != 32767:
                        maximum = v.limit_value
                else:
                    raise ValueError("Don't know what to do with validator of type %s" % type(v))
            choices = [(i, str(i)) for i in range(minimum, maximum + 1)]
        for value, label in choices:
            total = {'total': counts.get(value, 0)}
            for lang, name in settings.FRONTEND_LANGUAGES:
                with override(language=lang):
                    total['label_{}'.format(lang)] = force_text(label)
            totals.append(total)
        return totals


class ServiceTypeWaitTimeSerializer(BaseServiceTypeAggregateSerializer):
    """Wait time feedback bucket totals per service type."""

    aggregate_field = 'wait_time'


class ServiceTypeQOSSerializer(BaseServiceTypeAggregateSerializer):
    """QOS rating totals per service type"""

    aggregate_field = 'quality'


class ServiceTypeFailureSerializer(BaseServiceTypeAggregateSerializer):
    """Non-deliver explanations per service type"""

    aggregate_field = 'non_delivery_explained'


class ServiceTypeContactSerializer(BaseServiceTypeAggregateSerializer):
    """Difficulties contacting per service type"""

    aggregate_field = 'difficulty_contacting'


class ServiceTypeCommunicationSerializer(BaseServiceTypeAggregateSerializer):
    """Satisfaction with Staff Communication by Service Type"""

    aggregate_field = 'staff_satisfaction'


#
# V2 only serializers
#
class UserPermissionSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField(required=False)

    def get_permissions(self, obj):
        return obj.get_all_permissions()

    class Meta:
        model = EmailUser
        fields = ('email', 'permissions')

class GeographicRegionSerializerV2(serializers.ModelSerializer):
    content = serializers.SerializerMethodField()
    important = serializers.SerializerMethodField()
    banners = serializers.SerializerMethodField()
    name = serializers.SerializerMethodField()
    updated_at = serializers.SerializerMethodField()
    envelope = serializers.SerializerMethodField(required=False)

    def __init__(self, *args, **kwargs):
        super(GeographicRegionSerializerV2, self).__init__(*args, **kwargs)
        if 'request' in self.context and 'kwargs' in self.context['request'].parser_context:
            status = self.context['request'].parser_context['kwargs'].get(
                'environment',
                self.context['request'].query_params.get('status', 'production')
            )
        else:
            status = self.context['request'].query_params.get('status', 'production')

        self.status = status
        self.language = self.context['request'].query_params.get('language', 'en')


    def get_name(self, obj):
        return getattr(obj, 'title_' + self.language) or obj.title_en

    def get_updated_at(self, obj):
        return obj.pages.filter(status=self.status).aggregate(Max('updated_at')).get("updated_at__max")

    def get_envelope(self, obj):
        return json.loads(obj.geom.envelope.json)

    class Meta:
        model = GeographicRegion
        fields = ('id', 'name', 'slug', 'code', 'hidden', 'updated_at', 'content', 'important', 'banners', 'envelope')


class GeographicRegionSerializerV2NoContent(serializers.ModelSerializer):
    name = serializers.SerializerMethodField()
    full_slug = serializers.CharField(required=False)
    distance = serializers.SerializerMethodField(required=False)

    def __init__(self, *args, **kwargs):
        super(GeographicRegionSerializerV2NoContent, self).__init__(*args, **kwargs)
        self.language = self.context['request'].query_params.get('language', 'en')

    def get_name(self, obj):
        return getattr(obj, 'title_' + self.language) or obj.title_en

    def get_distance(self, obj):
        return obj.distance.km if hasattr(obj, 'distance') else 0

    class Meta:
        model = GeographicRegion
        fields = ('id', 'slug', 'full_slug', 'name', 'parent', 'level', 'code', 'hidden', 'distance')

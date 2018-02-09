import random
import string

import factory
import factory.fuzzy
from django.contrib.gis.geos import fromstr
from slugify import slugify

from api.utils import generate_translated_fields
from cms.models import Page\
    # , Section
from email_user.tests.factories import EmailUserFactory
from regions.models import GeographicRegion

from services.models import Provider, ProviderType, SelectionCriterion, Service, ServiceArea, \
    ServiceType, Feedback, Nationality, RequestForService


class FuzzyURL(factory.fuzzy.BaseFuzzyAttribute):
    """Random URL"""
    def fuzz(self):
        chars = ''.join([random.choice(string.ascii_lowercase) for _i in range(10)])
        return 'http://www.%s.com' % chars


class FuzzyLocation(factory.fuzzy.BaseFuzzyAttribute):
    """random geographic location"""
    def fuzz(self):
        longitude = random.uniform(-180.0, 180.0)
        latitude = random.uniform(-90.0, 90.0)
        return "POINT( %f %f )" % (longitude, latitude)


class TranslatableDjangoModelFactory(factory.DjangoModelFactory):

    @classmethod
    def create(cls, **kwargs):
        for field in getattr(cls, '_translatable_fields', []):
            for translated_field in generate_translated_fields(field, False):
                cls._meta.declarations[translated_field] = factory.fuzzy.FuzzyText()
        return super().create(**kwargs)


class ProviderTypeFactory(TranslatableDjangoModelFactory):
    class Meta:
        model = ProviderType
        django_get_or_create = ('number',)
    _translatable_fields = ['name']

    number = factory.Sequence(lambda n: n)


def create_valid_phone_number(stub):
    # Valid Lebanon phone number, ##-######
    chars = string.digits
    prefix = ''.join([random.choice(chars) for _i in range(2)])
    suffix = ''.join([random.choice(chars) for _i in range(6)])
    return "%s-%s" % (prefix, suffix)


class ProviderFactory(TranslatableDjangoModelFactory):
    class Meta:
        model = Provider
    _translatable_fields = ['name', 'description', 'focal_point_name', 'address']

    type = factory.SubFactory(ProviderTypeFactory)
    user = factory.SubFactory(EmailUserFactory)
    number_of_monthly_beneficiaries = factory.fuzzy.FuzzyInteger(0, 999999)
    phone_number = factory.LazyAttribute(create_valid_phone_number)
    website = FuzzyURL()
    focal_point_phone_number = factory.LazyAttribute(create_valid_phone_number)


class ServiceTypeFactory(TranslatableDjangoModelFactory):
    class Meta:
        model = ServiceType
        django_get_or_create = ('number', )
    _translatable_fields = ['name', 'comments']

    number = factory.Sequence(lambda n: n)
    vector_icon = factory.fuzzy.FuzzyText()


class GeographicRegionFactory(TranslatableDjangoModelFactory):
    class Meta:
        model = GeographicRegion

    level = factory.fuzzy.FuzzyChoice([1, 2, 3])
    name = factory.fuzzy.FuzzyText()
    slug = factory.LazyAttribute(lambda region: slugify(region.name))
    geom = fromstr('MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)), '
                   '((15 5, 40 10, 10 20, 5 10, 15 5)))', srid=4326)


class ServiceAreaFactory(TranslatableDjangoModelFactory):
    class Meta:
        model = ServiceArea
    _translatable_fields = ['name']

    geographic_region = factory.SubFactory(GeographicRegionFactory)


class ServiceFactory(TranslatableDjangoModelFactory):
    class Meta:
        model = Service
    _translatable_fields = ['name', 'description', 'additional_info']

    provider = factory.SubFactory(ProviderFactory)
    region = factory.SubFactory(GeographicRegionFactory)
    type = factory.SubFactory(ServiceTypeFactory)
    location = FuzzyLocation()
    cost_of_service = factory.fuzzy.FuzzyText()
    image = factory.django.ImageField()


class SelectionCriterionFactory(TranslatableDjangoModelFactory):
    class Meta:
        model = SelectionCriterion
    _translatable_fields = ['text']

    service = factory.SubFactory(ServiceFactory)


# I'm a bit surprised at having to write all this boilerplate code,
# but I didn't see anything in FactoryBoy that would do it for us.
# Somebody clue me in if I'm missing something, please.
def random_boolean():
    return random.choice([False, True])


def random_nationality():
    return random.choice(Nationality.objects.all())


def random_service_area():
    return random.choice(ServiceArea.objects.all())


def get_random_value_for_choice_field(field_name):
    field = Feedback._meta.get_field(field_name)
    choices = [value for value, name in field.flatchoices]
    return random.choice(choices)


def random_difficulty_contacting():
    return get_random_value_for_choice_field('difficulty_contacting')


def random_non_delivery_explained():
    return get_random_value_for_choice_field('non_delivery_explained')


def get_wait_time(stub):
    if stub.delivered:
        return get_random_value_for_choice_field('wait_time')


def get_wait_time_satisfaction(stub):
    if stub.delivered:
        return random.randint(1, 5)


def get_quality(stub):
    if stub.delivered:
        return random.randint(1, 5)


def get_other_difficulties(stub):
    if stub.difficulty_contacting == 'other':
        chars = [random.choice(string.ascii_letters) for _i in range(10)]
        return ''.join(chars)
    return ''


class FeedbackFactory(factory.DjangoModelFactory):
    class Meta:
        model = Feedback

    delivered = factory.fuzzy.FuzzyAttribute(random_boolean)
    nationality = factory.fuzzy.FuzzyAttribute(random_nationality)
    staff_satisfaction = factory.fuzzy.FuzzyInteger(1, 5)
    area_of_residence = factory.fuzzy.FuzzyAttribute(random_service_area)
    service = factory.SubFactory(ServiceFactory)
    non_delivery_explained = factory.fuzzy.FuzzyAttribute(random_non_delivery_explained)
    name = factory.fuzzy.FuzzyText()
    phone_number = factory.LazyAttribute(create_valid_phone_number)
    difficulty_contacting = factory.fuzzy.FuzzyAttribute(random_difficulty_contacting)
    extra_comments = factory.fuzzy.FuzzyText()

    # These only have to be set if delivered is True
    quality = factory.LazyAttribute(get_quality)
    wait_time = factory.LazyAttribute(get_wait_time)
    wait_time_satisfaction = factory.LazyAttribute(get_wait_time_satisfaction)

    # This only has to be set if difficulty_contacting was 'other'
    other_difficulties = factory.LazyAttribute(get_other_difficulties)


class RequestForServiceFactory(factory.DjangoModelFactory):
    class Meta:
        model = RequestForService

    provider_name = factory.fuzzy.FuzzyText(length=50)
    service_name = factory.fuzzy.FuzzyText(length=50)
    area_of_service = factory.fuzzy.FuzzyAttribute(random_service_area)
    service_type = factory.SubFactory(ServiceTypeFactory)
    address = factory.fuzzy.FuzzyText(length=150)
    contact = factory.fuzzy.FuzzyText(length=150)
    description = factory.fuzzy.FuzzyText(length=150)
    rating = factory.fuzzy.FuzzyInteger(1, 5)


class PageFactory(factory.DjangoModelFactory):
    class Meta:
        model = Page
        django_get_or_create = ('slug', )

    title = 'test test test'
    slug = factory.LazyAttribute(lambda o: slugify(o.title))

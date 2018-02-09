# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import migrations

from services.utils import permission_names_to_objects

INITIAL_PROVIDER_TYPES = [
    dict(number=1, name_en="Local NGO", name_ar="منظمة غير حكومية محلية"),
    dict(number=2, name_en="International NGO", name_ar="منظمة غير حكومية عالمية"),
    dict(number=3, name_en="Public Hospitals", name_ar="مستشفيات حكومية"),
    dict(number=4, name_en="Public Schools", name_ar="مدارس رسمية"),
    dict(number=5, name_en="Private Hospitals", name_ar="مستشفيات خاصة"),
    dict(number=6, name_en="Private Schools", name_ar="مدارس خاصة"),
    dict(number=7, name_en="Community Centers", name_ar="مراكز إجتماعية"),
    dict(number=8, name_en="UN Agency", name_ar="وكالة الأمم المتحدة"),
]


def no_op(apps, schema_editor):
    pass


def create_provider_types(apps, schema_editor):
    ProviderType = apps.get_model('services', 'ProviderType')
    for value in INITIAL_PROVIDER_TYPES:
        ProviderType.objects.get_or_create(
            number=value['number'],
            defaults=value,
        )


INITIAL_SERVICE_TYPES = [
    dict(number=1, name_en='Education Services', name_ar='خدمات التعليم'),
    dict(number=2, name_en='Health Services', name_ar='الخدمات الصحية',
         comments_en='including psychosocial and disabilities'),
    dict(number=3, name_en='Shelter & Wash Services', name_ar='المأوى وخدمات الصرف الصحي والنظافة',
         comments_en='including shelter rehabilitation'),
    dict(number=4, name_en='Financial services', name_ar='الخدمات المالية',
         comments_en='including unconditional cash assistance'),
    dict(number=5, name_en='Legal services', name_ar='الخدمات القانونية'),
    dict(number=6, name_en='Food Security', name_ar='الإعاشات الغذائية'),
    dict(number=7, name_en='Material Support (excluding cash and food)',
         name_ar='المساعدات العينية الغير غذائية والغير مالية'),
    dict(number=8, name_en='Community centers', name_ar='المراكز الإجتماعية',
         comments_en='including vocational trainings and awareness sessions'),
]


def create_service_types(apps, schema_editor):
    ServiceType = apps.get_model('services', 'ServiceType')
    for value in INITIAL_SERVICE_TYPES:
        ServiceType.objects.get_or_create(
            number=value['number'],
            defaults=value,
        )


# Permissions needed by staff
# Permission names are "applabel.action_lowercasemodelname"
STAFF_PERMISSIONS = [
    'services.change_provider',
    'services.change_service',
    'services.change_selectioncriterion',
]

# Typical provider permissions
PROVIDER_PERMISSIONS = [
    'services.add_provider',
    'services.change_provider',
    'services.add_service',
    'services.change_service',
    'services.add_selectioncriterion',
    'services.change_selectioncriterion',
]


def create_groups(apps, schema_editor):
    Group = apps.get_model('auth', 'Group')
    Permission = apps.get_model('auth', 'Permission')
    ContentType = apps.get_model('contenttypes', 'ContentType')

    group, unused = Group.objects.get_or_create(name='Staff')
    group.permissions.add(*permission_names_to_objects(STAFF_PERMISSIONS, Permission, ContentType))

    group, unused = Group.objects.get_or_create(name='Providers')
    group.permissions.add(*permission_names_to_objects(PROVIDER_PERMISSIONS, Permission, ContentType))


class Migration(migrations.Migration):
    dependencies = [
        ('services', '0010_auto_20160403_1905'),
    ]

    operations = [
        migrations.RunPython(
            code=create_service_types,
            reverse_code=no_op,
            atomic=True
        ),
        migrations.RunPython(
            code=create_groups,
            reverse_code=no_op,
            atomic=True
        ),
        migrations.RunPython(
            code=create_groups,
            reverse_code=no_op,
            atomic=True
        ),
    ]

# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2017-06-30 12:05
from __future__ import unicode_literals

from django.db import migrations, models
import django.db.models.deletion


def forwards_func(apps, schema_editor):
    service_model = apps.get_model('services', 'Service')
    services = service_model.objects.filter(type__isnull=False)
    for service in services:
        service.types.add(service.type)
        service.save()


def reverse_func(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0038_auto_20170626_1559'),
    ]

    operations = [
        migrations.AddField(
            model_name='service',
            name='types',
            field=models.ManyToManyField(blank=True, to='services.ServiceType', verbose_name='types'),
        ),
        migrations.AlterField(
            model_name='service',
            name='type',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.CASCADE, related_name='service_type', to='services.ServiceType', verbose_name='type'),
        ),
        migrations.RunPython(forwards_func, reverse_func)
    ]

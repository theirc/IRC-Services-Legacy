# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2017-05-15 09:37
from __future__ import unicode_literals

from django.db import migrations, models
import json


OLD_FIELDS = [('sunday', 'sunday_open', 'sunday_close'),
              ('monday', 'monday_open', 'monday_close'),
              ('tuesday', 'tuesday_open', 'tuesday_close'),
              ('wednesday', 'wednesday_open', 'wednesday_close'),
              ('thursday', 'thursday_open', 'thursday_close'),
              ('friday', 'friday_open', 'friday_close'),
              ('saturday', 'saturday_open', 'saturday_close'), ]


def forwards_func(apps, schema_editor):
    service_model = apps.get_model('services', 'Service')
    services = service_model.objects.all()
    for service in services:
        opening_time = {'24/7': False}
        for day, o, c in OLD_FIELDS:
            open_hour = getattr(service, o)
            close_hour = getattr(service, c)
            if open_hour and close_hour:
                opening_time[day] = [{'open': open_hour.isoformat(), 'close': close_hour.isoformat()}]
            else:
                opening_time[day] = [{'open': None, 'close': None}]
        service.opening_time = json.dumps(opening_time)
        service.save()


def reverse_func(apps, schema_editor):
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0033_auto_20170427_1324'),
    ]

    operations = [
        migrations.AddField(
            model_name='service',
            name='opening_time',
            field=models.TextField(blank=True, null=True),
        ),
        migrations.RunPython(forwards_func, reverse_func)
    ]

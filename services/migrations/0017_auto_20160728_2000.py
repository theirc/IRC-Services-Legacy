# -*- coding: utf-8 -*-
# Generated by Django 1.9.5 on 2016-07-28 20:00
from __future__ import unicode_literals

from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0016_auto_20160726_2222'),
    ]

    operations = [
        migrations.AlterField(
            model_name='provider',
            name='focal_point_phone_number',
            field=models.CharField(blank=True, max_length=20, null=True, verbose_name='focal point phone number'),
        ),
        migrations.AlterField(
            model_name='provider',
            name='user',
            field=models.OneToOneField(blank=True, help_text='user account for this provider', null=True, on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL, verbose_name='user'),
        ),
    ]

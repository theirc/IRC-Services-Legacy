# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2017-06-26 15:59
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0037_service_created_at'),
    ]

    operations = [
        migrations.RenameField(
            model_name='serviceconfirmationlog',
            old_name='confirmed_by',
            new_name='sent_to',
        ),
        migrations.AlterField(
            model_name='serviceconfirmationlog',
            name='status',
            field=models.CharField(blank=True, choices=[('confirmed', 'Confirmed'), ('pending', 'Pending'), ('pending_reminder', 'Pending after reminder'), ('outdated', 'Service needs update'), ('error', 'Error occurred during email sending')], max_length=255, null=True),
        ),
    ]

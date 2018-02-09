# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2017-07-11 12:15
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0040_service_newsletter_valid_email'),
    ]

    operations = [
        migrations.AlterField(
            model_name='serviceconfirmationlog',
            name='status',
            field=models.CharField(blank=True, choices=[('confirmed', 'Confirmed'), ('pending', 'Pending'), ('pending_reminder', 'Pending after reminder'), ('pending_unconfirmed_reminder', 'Pending after unconfirmed reminder'), ('outdated', 'Service needs update'), ('error', 'Error occurred during email sending')], max_length=255, null=True),
        ),
    ]

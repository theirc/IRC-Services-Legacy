# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('regions', '0002_ipgeolocation'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ipgeolocation',
            name='postal_code',
            field=models.CharField(blank=True, max_length=50, null=True),
            preserve_default=True,
        ),
    ]

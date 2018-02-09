# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0002_auto_20160326_1842'),
    ]

    operations = [
        migrations.AddField(
            model_name='geographicregion',
            name='slug',
            field=models.CharField(max_length=100, null=True, blank=True),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='geographicregion',
            name='code',
            field=models.CharField(max_length=16, blank=True),
            preserve_default=True,
        ),
    ]

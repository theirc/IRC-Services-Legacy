# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0006_auto_20160327_1116'),
        ('regions', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='geographicregion',
            name='parent',
        ),
        migrations.AlterField(
            model_name='servicearea',
            name='geographic_region',
            field=models.ForeignKey(to='regions.GeographicRegion', null=True, on_delete=django.db.models.deletion.SET_NULL, default=None),
            preserve_default=True,
        ),
        migrations.DeleteModel(
            name='GeographicRegion',
        ),
    ]

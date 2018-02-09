# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0001_initial'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='geographicregion',
            name='cad_code',
        ),
        migrations.RemoveField(
            model_name='geographicregion',
            name='cad_name',
        ),
        migrations.RemoveField(
            model_name='geographicregion',
            name='kada_name',
        ),
        migrations.RemoveField(
            model_name='geographicregion',
            name='kadaa_code',
        ),
        migrations.RemoveField(
            model_name='geographicregion',
            name='moh_cod',
        ),
        migrations.RemoveField(
            model_name='geographicregion',
            name='moh_na',
        ),
        migrations.AlterField(
            model_name='geographicregion',
            name='area',
            field=models.FloatField(default=0),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='geographicregion',
            name='level',
            field=models.IntegerField(choices=[(1, 'Country'), (2, 'City or Region')]),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='geographicregion',
            name='perimeter',
            field=models.FloatField(default=0),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='geographicregion',
            name='shape_area',
            field=models.FloatField(default=0),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='geographicregion',
            name='shape_leng',
            field=models.FloatField(default=0),
            preserve_default=True,
        ),
    ]

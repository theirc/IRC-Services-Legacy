# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import django.contrib.gis.db.models.fields


class Migration(migrations.Migration):

    dependencies = [
    ]

    operations = [
        migrations.CreateModel(
            name='GeographicRegion',
            fields=[
                ('id', models.AutoField(serialize=False, primary_key=True, verbose_name='ID', auto_created=True)),
                ('level', models.IntegerField(choices=[(1, 'Country'), (2, 'Region'), (3, 'City')])),
                ('geom', django.contrib.gis.db.models.fields.MultiPolygonField(srid=4326)),
                ('name', models.CharField(max_length=60)),
                ('slug', models.CharField(blank=True, max_length=100, null=True)),
                ('code', models.CharField(blank=True, max_length=16)),
                ('parent', models.ForeignKey(to='regions.GeographicRegion', blank=True, related_name='children', null=True)),
            ],
            options={
                'ordering': ['level', 'name'],
            },
            bases=(models.Model,),
        ),
    ]

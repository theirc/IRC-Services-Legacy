# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('regions', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='IPGeoLocation',
            fields=[
                ('id', models.AutoField(verbose_name='ID', primary_key=True, serialize=False, auto_created=True)),
                ('network', models.IPAddressField(null=True, blank=True)),
                ('geoname_id', models.IntegerField(default=0)),
                ('registered_country_geoname_id', models.IntegerField(default=0)),
                ('represented_country_geoname_id', models.IntegerField(default=0)),
                ('is_anonymous_proxy', models.NullBooleanField(default=False)),
                ('is_satellite_provider', models.NullBooleanField(default=False)),
                ('postal_code', models.CharField(max_length=50, blank=True)),
                ('latitude', models.DecimalField(decimal_places=14, max_digits=17, null=True, default=0)),
                ('longitude', models.DecimalField(decimal_places=14, max_digits=17, null=True, default=0)),
            ],
            options={
            },
            bases=(models.Model,),
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import services.models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0008_auto_20160330_1516'),
    ]

    operations = [
        migrations.AddField(
            model_name='nationality',
            name='name_es',
            field=models.CharField(default='', verbose_name='name in Spanish', blank=True, max_length=256),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='provider',
            name='address_es',
            field=models.TextField(default='', verbose_name='provider address in Spanish', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='provider',
            name='description_es',
            field=models.TextField(default='', verbose_name='description in Spanish', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='provider',
            name='focal_point_name_es',
            field=models.CharField(max_length=256, default='', verbose_name='focal point name in Spanish', blank=True, validators=[services.models.blank_or_at_least_one_letter]),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='provider',
            name='name_es',
            field=models.CharField(max_length=256, default='', verbose_name='Name in Spanish', blank=True, validators=[services.models.blank_or_at_least_one_letter]),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='providertype',
            name='name_es',
            field=models.CharField(default='', verbose_name='Name in Spanish', blank=True, max_length=256),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='selectioncriterion',
            name='text_es',
            field=models.CharField(default='', blank=True, max_length=100),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='service',
            name='additional_info_es',
            field=models.TextField(default='', verbose_name='additional information in Spanish', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='service',
            name='description_es',
            field=models.TextField(default='', verbose_name='description in Spanish', blank=True),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='service',
            name='name_es',
            field=models.CharField(default='', verbose_name='name in Spanish', blank=True, max_length=256),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='servicearea',
            name='name_es',
            field=models.CharField(default='', verbose_name='Name in Spanish', blank=True, max_length=256),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='servicetype',
            name='comments_es',
            field=models.CharField(default='', verbose_name='comments in Spanish', blank=True, max_length=512),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='servicetype',
            name='name_es',
            field=models.CharField(default='', verbose_name='name in Spanish', blank=True, max_length=256),
            preserve_default=True,
        ),
    ]

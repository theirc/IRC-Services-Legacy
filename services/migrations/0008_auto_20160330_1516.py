# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations
import services.models


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0007_auto_20160327_1129'),
    ]

    operations = [
        migrations.AddField(
            model_name='nationality',
            name='name_el',
            field=models.CharField(blank=True, max_length=256, verbose_name='name in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='provider',
            name='address_el',
            field=models.TextField(blank=True, verbose_name='provider address in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='provider',
            name='description_el',
            field=models.TextField(blank=True, verbose_name='description in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='provider',
            name='focal_point_name_el',
            field=models.CharField(validators=[services.models.blank_or_at_least_one_letter], blank=True, max_length=256, verbose_name='focal point name in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='provider',
            name='name_el',
            field=models.CharField(validators=[services.models.blank_or_at_least_one_letter], blank=True, max_length=256, verbose_name='Name in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='providertype',
            name='name_el',
            field=models.CharField(blank=True, max_length=256, verbose_name='Name in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='selectioncriterion',
            name='text_el',
            field=models.CharField(blank=True, max_length=100, default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='service',
            name='additional_info_el',
            field=models.TextField(blank=True, verbose_name='additional information in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='service',
            name='description_el',
            field=models.TextField(blank=True, verbose_name='description in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='service',
            name='name_el',
            field=models.CharField(blank=True, max_length=256, verbose_name='name in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='servicearea',
            name='name_el',
            field=models.CharField(blank=True, max_length=256, verbose_name='Name in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='servicetype',
            name='comments_el',
            field=models.CharField(blank=True, max_length=512, verbose_name='comments in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AddField(
            model_name='servicetype',
            name='name_el',
            field=models.CharField(blank=True, max_length=256, verbose_name='name in Greek', default=''),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='feedback',
            name='phone_number',
            field=models.CharField(max_length=20, verbose_name='Phone Number)'),
            preserve_default=True,
        ),
        migrations.AlterField(
            model_name='provider',
            name='phone_number',
            field=models.CharField(max_length=20, verbose_name='phone number'),
            preserve_default=True,
        ),
    ]

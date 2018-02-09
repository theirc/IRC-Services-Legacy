# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0009_auto_20160331_1055'),
    ]

    operations = [
        migrations.AlterField(
            model_name='feedback',
            name='phone_number',
            field=models.CharField(max_length=20, verbose_name='Phone Number'),
            preserve_default=True,
        ),
    ]

# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0003_auto_20160326_2026'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='geographicregion',
            name='area',
        ),
        migrations.RemoveField(
            model_name='geographicregion',
            name='perimeter',
        ),
        migrations.RemoveField(
            model_name='geographicregion',
            name='shape_area',
        ),
        migrations.RemoveField(
            model_name='geographicregion',
            name='shape_leng',
        ),
    ]

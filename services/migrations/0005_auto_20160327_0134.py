# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0004_auto_20160326_2026'),
    ]

    operations = [
        migrations.RenameField(
            model_name='servicearea',
            old_name='lebanon_region',
            new_name='geographic_region',
        ),
    ]

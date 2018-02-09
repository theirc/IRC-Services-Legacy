# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('regions', '0003_auto_20160327_1714'),
    ]

    operations = [
        migrations.AlterField(
            model_name='ipgeolocation',
            name='network',
            field=models.CharField(blank=True, max_length=50, null=True),
            preserve_default=True,
        ),
    ]

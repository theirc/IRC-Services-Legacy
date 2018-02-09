# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('regions', '0004_auto_20160327_1745'),
    ]

    operations = [
        migrations.AddField(
            model_name='ipgeolocation',
            name='type',
            field=models.CharField(default='v4', max_length=2, choices=[('v4', 'IPV4'), ('v6', 'IPV6')]),
            preserve_default=True,
        ),
    ]

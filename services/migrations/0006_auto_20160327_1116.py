# -*- coding: utf-8 -*-
from __future__ import unicode_literals

from django.db import models, migrations


class Migration(migrations.Migration):

    dependencies = [
        ('services', '0005_auto_20160327_0134'),
    ]

    operations = [
        migrations.AlterField(
            model_name='geographicregion',
            name='level',
            field=models.IntegerField(choices=[(1, 'Country'), (2, 'Region'), (3, 'City')]),
            preserve_default=True,
        ),
    ]

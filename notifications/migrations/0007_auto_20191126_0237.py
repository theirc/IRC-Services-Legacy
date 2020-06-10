# -*- coding: utf-8 -*-
# Generated by Django 1.10.1 on 2019-11-26 02:37
from __future__ import unicode_literals

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('notifications', '0006_messagelog'),
    ]

    operations = [
        migrations.CreateModel(
            name='EventLog',
            fields=[
                ('id', models.AutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('created', models.DateTimeField(auto_now_add=True)),
                ('phone', models.CharField(max_length=255, verbose_name='phone')),
                ('event', models.CharField(blank=True, max_length=255)),
                ('message', models.CharField(blank=True, max_length=255)),
                ('country', models.CharField(blank=True, max_length=255)),
            ],
        ),
        migrations.DeleteModel(
            name='MessageLog',
        ),
        migrations.AddField(
            model_name='usersubscription',
            name='code',
            field=models.CharField(default=0, max_length=20),
            preserve_default=False,
        ),
    ]

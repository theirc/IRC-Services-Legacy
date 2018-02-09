from django.contrib import admin
from reversion.admin import VersionAdmin
from . import models


class GeographicRegionAdmin(VersionAdmin):
    list_display = [
        'level',
        'name',
        'code',
        'parent',
    ]
    list_filter = [
        'level',
        'parent',
    ]
    list_select_related = ['parent']


class ImportantInformationAdmin(VersionAdmin):
    list_display = [
        'name',
        'region',
    ]
    list_filter = [
        'region',
    ]
    list_select_related = ['region']


class ContentRateAdmin(VersionAdmin):
    list_display = [
        'id',
        'region',
        'content_index',
        'content_slug',
        'thumbs_up',
        'thumbs_down',
    ]


class MicroAppAdmin(VersionAdmin):
    pass


admin.site.register(models.GeographicRegion, GeographicRegionAdmin)
admin.site.register(models.ImportantInformation, ImportantInformationAdmin)
admin.site.register(models.ContentRate, ContentRateAdmin)

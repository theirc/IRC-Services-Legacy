from django import forms
from django.conf import settings
from django.contrib import admin, messages
from django.contrib.admin.templatetags.admin_urls import add_preserved_filters
from django.contrib.gis.forms import BaseGeometryWidget, PointField
from django.core.exceptions import ValidationError
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _
from reversion.admin import VersionAdmin
from sorl.thumbnail.admin import AdminImageMixin

from api.utils import generate_translated_fields
from services.models import Provider, Service, ServiceArea, SelectionCriterion, ProviderType, \
    ServiceType, JiraUpdateRecord, Feedback, Nationality, RequestForService
from services.utils import validation_error_as_text


class ProviderAdmin(admin.ModelAdmin):
    list_display = generate_translated_fields('name', False) + ['type']
    list_display_links = list_display


class FeedbackAdmin(VersionAdmin):
    list_display = ['service', 'name']


class ProviderTypeAdmin(admin.ModelAdmin):
    list_display = generate_translated_fields('name', False)
    list_display_links = list_display


class NationalityAdmin(VersionAdmin):
    pass


class ServiceTypeAdmin(admin.ModelAdmin):
    list_display = ['number'] + generate_translated_fields('name', False) \
                   + generate_translated_fields('comments', False)


class SelectionCriterionAdmin(admin.ModelAdmin):
    list_display = ['service'] + generate_translated_fields('text', False)


class SelectionCriterionInlineAdmin(admin.TabularInline):
    model = SelectionCriterion
    fields = generate_translated_fields('text', False)


class LocationWidget(BaseGeometryWidget):
    template_name = 'gis/googlemaps.html'

    class Media:
        js = (
            "//maps.googleapis.com/maps/api/js?v=3.exp&key=AIzaSyAFC16LPK856xag5svt3_IxTyy0KI4Bc_I&libraries=places",
            "js/duckling-map-widget.js"
        )
        css = {
            'all': ("css/duckling-map-widget.css",),
        }

    def deserialize(self, value):
        if not value:
            return None
        return super(LocationWidget, self).deserialize(value)


class ServiceAdminForm(forms.ModelForm):
    location = PointField(widget=LocationWidget())

    class Meta:
        exclude = []
        model = Service


class ServiceAdmin(AdminImageMixin, VersionAdmin):
    class Media:
        css = {
            "all": ("css/service-admin.css",)
        }

    form = ServiceAdminForm

    actions = ['approve', 'reject']
    fieldsets = (
        (None, {
            'fields': [
                'provider',
                ('status', 'types'),
                tuple(generate_translated_fields('name', False)),
                'region',
                'cost_of_service',
                'update_of',
                'phone_number',
            ],
        }),
        (_('Address'), {
            'classes': ('collapse',),
            'fields':
                generate_translated_fields('address', False)

        }),
        (_('Description and Additional Information'), {
            'classes': ('collapse',),
            'fields':
                generate_translated_fields('description', False) +
                generate_translated_fields('additional_info', False)

        }),
        (_('Hours (all times in time zone {timezone})').format(timezone=settings.TIME_ZONE), {
            'classes': ('collapse',),
            'fields': [
                ('sunday_open', 'sunday_close',),
                ('monday_open', 'monday_close',),
                ('tuesday_open', 'tuesday_close',),
                ('wednesday_open', 'wednesday_close',),
                ('thursday_open', 'thursday_close',),
                ('friday_open', 'friday_close',),
                ('saturday_open', 'saturday_close',),
            ]
        }),
        (_('Location'), {
            'fields': ['location'],
        }),
        (_('Image'), {
            'fields': ['image', ]
        }),
    )
    inlines = [SelectionCriterionInlineAdmin]
    list_display = generate_translated_fields('name', False) + \
                   ['provider',
                    'get_types',
                    'status',
                    'region',
                    'show_image']
    list_display_links = generate_translated_fields('name', False) + ['provider', 'region']
    list_filter = ['status', 'type']
    readonly_fields = ['status']

    def approve(self, request, queryset):
        # All must be in DRAFT status
        if queryset.exclude(status=Service.STATUS_DRAFT).exists():
            self.message_user(request,
                              _("Only services in draft status may be approved"),
                              messages.ERROR)
            return
        any_approved = False
        for service in queryset:
            try:
                service.staff_approve(request.user)
            except ValidationError as e:
                msg = _("Unable to approve service '{name}': {error}.")
                msg = msg.format(name=service.name, error=validation_error_as_text(e))
                messages.error(request, msg)
            else:
                any_approved = True
        if any_approved:
            self.message_user(request, _("Services have been approved"))

    approve.short_description = _("Approve new or changed service")

    def reject(self, request, queryset):
        # All must be in DRAFT status
        if queryset.exclude(status=Service.STATUS_DRAFT).exists():
            self.message_user(request,
                              _("Only services in draft status may be rejected"),
                              messages.ERROR)
            return
        any_rejected = False
        for service in queryset:
            try:
                service.staff_reject(request.user)
            except ValidationError as e:
                msg = _("Unable to reject service '{name}': {error}.")
                msg = msg.format(name=service.name, error=validation_error_as_text(e))
                messages.error(request, msg)
            else:
                any_rejected = True
        if any_rejected:
            self.message_user(request, _("Services have been rejected"))

    reject.short_description = _("Reject new or changed service")

    def response_change(self, request, obj):
        """
        Determines the HttpResponse for the change_view stage.
        """
        if '_approve' in request.POST:
            try:
                obj.staff_approve(request.user)
            except ValidationError as e:
                msg = _("Unable to approve service '{name}': {error}.")
                msg = msg.format(name=obj.name, error=validation_error_as_text(e))
                self.message_user(request, msg, messages.ERROR)
                redirect_url = add_preserved_filters(
                    {'preserved_filters': self.get_preserved_filters(request),
                     'opts': self.model._meta},
                    request.path)
                return HttpResponseRedirect(redirect_url)
            else:
                msg = _('The service was approved successfully.')
                self.message_user(request, msg, messages.SUCCESS)
        elif '_reject' in request.POST:
            try:
                obj.staff_reject(request.user)
            except ValidationError as e:
                msg = _("Unable to reject service '{name}': {error}.")
                msg = msg.format(name=obj.name, error=validation_error_as_text(e))
                self.message_user(request, msg, messages.ERROR)
                redirect_url = add_preserved_filters(
                    {'preserved_filters': self.get_preserved_filters(request),
                     'opts': self.model._meta},
                    request.path)
                return HttpResponseRedirect(redirect_url)
            else:
                msg = _('The service was rejected successfully.')
                self.message_user(request, msg, messages.INFO)
        return super().response_change(request, obj)

    def show_image(self, obj):
        """Create a thumbnail of this image to show in the admin list."""
        thumbnail_url = obj.get_thumbnail_url()
        if thumbnail_url:
            return '<img src="{}" />'.format(thumbnail_url)
        return _("no image")

    def get_types(self, obj):
        return ','.join([t.name_en for t in obj.types.all()])

    show_image.allow_tags = True
    show_image.short_description = "Image"


class ServiceAreaAdmin(VersionAdmin):
    list_display = ['geographic_region', 'pk', 'parent'] + generate_translated_fields('name', False)


class JiraUpdateRecordAdmin(VersionAdmin):
    list_display = ('update_type', 'service', 'provider', 'jira_issue_key')


admin.site.register(Feedback, FeedbackAdmin)
admin.site.register(Nationality, NationalityAdmin)
admin.site.register(Provider, ProviderAdmin)
admin.site.register(ProviderType, ProviderTypeAdmin)
admin.site.register(ServiceType, ServiceTypeAdmin)
admin.site.register(Service, ServiceAdmin)
admin.site.register(ServiceArea, ServiceAreaAdmin)
admin.site.register(SelectionCriterion, SelectionCriterionAdmin)
admin.site.register(JiraUpdateRecord, JiraUpdateRecordAdmin)

admin.site.register(
    RequestForService,
    list_display=[
        'provider_name',
        'service_name',
    ]
)

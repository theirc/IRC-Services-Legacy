"""
Copied and adapted from
https://docs.djangoproject.com/en/1.7/topics/auth/customizing/#a-full-example
"""
from __future__ import absolute_import
from django.contrib import admin
from django.contrib import messages
from django.contrib.admin.templatetags.admin_urls import add_preserved_filters
from django.contrib.auth.admin import UserAdmin
from django.http import HttpResponseRedirect
from django.utils.translation import ugettext_lazy as _
from rest_framework.exceptions import ValidationError

from services.utils import validation_error_as_text
from .forms import EmailUserChangeForm, EmailUserCreationForm
from .models import EmailUser


class EmailUserAdmin(UserAdmin):
    # The forms to add and change user instances
    form = EmailUserChangeForm
    add_form = EmailUserCreationForm

    # The fields to be used in displaying the User model.
    # These override the definitions on the base UserAdmin
    # that reference specific fields on auth.User.
    list_display = ('email', 'is_staff', 'is_superuser', 'is_active')
    fieldsets = (
        (None, {'fields': ('email', 'password')}),
        (_('Permissions'), {'fields': ('is_active', 'is_staff', 'is_superuser',
                                       'groups', 'user_permissions')}),
        (_('Important dates'), {'fields': ('last_login', 'date_joined')}),
    )
    # add_fieldsets is not a standard ModelAdmin attribute. EmailUserAdmin
    # overrides get_fieldsets to use this attribute when creating a user.
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('email', 'password1', 'password2')
        }),
    )
    search_fields = ('email',)
    ordering = ('email',)

    def response_change(self, request, obj):
        """
        Determines the HttpResponse for the change_view stage.
        """
        if '_activate' in request.POST:
            try:
                obj.activate_provider()
            except ValidationError as e:
                msg = _("Unable to activate user '{email}': {error}.")
                msg = msg.format(name=obj.email, error=validation_error_as_text(e))
                self.message_user(request, msg, messages.ERROR)
                redirect_url = add_preserved_filters(
                    {'preserved_filters': self.get_preserved_filters(request),
                     'opts': self.model._meta},
                    request.path)
                return HttpResponseRedirect(redirect_url)
            else:
                msg = _('The account was activated successfully. Email has been sent to user.')
                self.message_user(request, msg, messages.SUCCESS)
        return super().response_change(request, obj)

# Now register the new UserAdmin...
admin.site.register(EmailUser, EmailUserAdmin)

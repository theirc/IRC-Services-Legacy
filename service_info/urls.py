import api.urls
import os
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth.views import password_reset_complete, password_reset_confirm, password_reset_done, \
    password_reset
from django.views.generic import TemplateView
from services.views import export_view, health_view, logout_view


# Our middleware will bypass locale middleware redirect processing
# of 404s for requests matching these patterns.  Because the Django
# CMS pattern matches anything, locale middleware thinks that
# redirecting to /<language>/api/bad might work, and the API client
# gets a hopeless 302.
NO_404_LOCALE_REDIRECTS = []

# Reminder: the `static` function is a no-op if DEBUG is False, as in production.
urlpatterns = [
    url(r'^health/$', health_view),
    url(r'^admin/', include(admin.site.urls)),
    url(r'^api/', include(api.urls)),

    url(r'^password_reset/$',
        password_reset,
        {'template_name': 'admin_panel/reset_form.html'},
        name='password_reset'),
    url(r'^password_reset/done/$',
        password_reset_done,
        {'template_name': 'admin_panel/reset_done.html'},
        name='password_reset_done'),
    url(r'^reset/(?P<uidb64>[0-9A-Za-z_\-]+)/' +
        '(?P<token>[0-9A-Za-z]{1,13}-[0-9A-Za-z]{1,20})/$',
        password_reset_confirm,
        {'template_name': 'admin_panel/reset_confirm.html'},
        name='password_reset_confirm'),
    url(r'^reset/done/$', password_reset_complete,
        {'template_name': 'admin_panel/reset_complete.html'},
        name='password_reset_complete'),
    url(r'^export/(?P<signature>.*)/$', export_view, name='export'),
    url(r'^ckeditor/', include('ckeditor_uploader.urls')),

    url(r'^e/(?P<environment>[0-9A-Za-z]+)/v2/', include('api.urls')),
    url(r'^', include('frontend.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT) \
    + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

if settings.DEBUG:
    try:
        import debug_toolbar

        urlpatterns += [
            url(r'^__debug__/', include(debug_toolbar.urls)),
        ]
    except:
        pass

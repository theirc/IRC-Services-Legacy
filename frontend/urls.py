from django.conf.urls import url, include
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from .views import FrontendAppView
from django.contrib.auth import views as auth_views


urlpatterns = [
    #url(r'^$', FrontendAppView.as_view(), name='admin-landing-page'),
    url(r'^login', auth_views.login, {'template_name': 'admin_panel/login.html'}, name='login'),
    #url(r'^logout/$', auth_views.logout,  {'template_name': 'admin_panel/logout.html'}, name='logout'),
    #url(r'^(?:.*)/?$', FrontendAppView.as_view(), name='admin-landing-page'),
    url(r'^.*', FrontendAppView.as_view(), name='admin-landing-page'),
]
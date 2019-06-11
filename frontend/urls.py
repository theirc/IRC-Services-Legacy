from django.conf.urls import url, include
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from .views import FrontendAppView
from django.contrib.auth import views as auth_views


urlpatterns = [
    url(r'^$', FrontendAppView.as_view(), name='admin-landing-page'),
    url(r'^(?:.*)/?$', FrontendAppView.as_view(), name='admin-landing-page'),
]
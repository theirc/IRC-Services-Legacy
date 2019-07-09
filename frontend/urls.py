from django.conf.urls import url, include
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from .views import FrontendAppView, LoginView
from django.contrib.auth import views as auth_views


urlpatterns = [
    url(r'^login', LoginView.as_view(), name='login'),
    url(r'^.*', FrontendAppView.as_view(), name='admin-landing-page'),
]
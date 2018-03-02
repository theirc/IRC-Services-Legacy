from django.conf.urls import url, include
from django.views.generic import TemplateView
from django.contrib.auth.decorators import login_required
from .views import LandingPageView

urlpatterns = [
    url(r'^$', LandingPageView.as_view(), name='admin-landing-page'),
]

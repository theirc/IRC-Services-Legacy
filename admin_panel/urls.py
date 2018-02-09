from django.conf.urls import url, include
from django.views.generic import TemplateView

from .views import LandingPageView

urlpatterns = [
    url(r'^$', LandingPageView.as_view(), name='admin-landing-page'),
    url(r'^time-picker.html$',
        TemplateView.as_view(template_name='angular/partials/time-picker.html'),
        name='time-picker'),
    url(r'^services-map.html$',
        TemplateView.as_view(template_name='angular/views/service/services-map.html'),
        name='services-map'),
]

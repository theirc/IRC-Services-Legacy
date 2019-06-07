from django.urls import path
from . import views
urlpatterns = [
    path(r'^', views.index ),
    path(r'^', views.index ),
    path(r'^(?:.*)/?$', views.index),
    url(r'^login/$', views.index),
]
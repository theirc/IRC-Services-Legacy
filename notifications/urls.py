from django.conf.urls import url
from notifications import views


urlpatterns = [
    url(r'^notifications/verifyphone/', views.verify_phone),
    url(r'^notifications/verifycode', views.verify_code),
    url(r'^notifications/content-publish', views.content_publish),
    url(r'^notifications/sms-received', views.sms_received),
    url(r'^notifications/task-created', views.task_created),
]
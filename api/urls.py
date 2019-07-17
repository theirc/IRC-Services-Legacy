from api.v2 import views as v2
from django.conf.urls import url, include
from rest_framework import routers

router = routers.DefaultRouter()
# base_name: override URL names for our user model - default would
# be based on 'email_user' but we want to base them on 'user' instead.
router.register(r'confirmation-logs', v2.ConfirmationLogsViewSet)
router.register(r'confirmation-log-list', v2.ConfirmationLogListViewSet)
router.register(r'groups', v2.GroupViewSet, base_name='group')

router.register(r'list-private-providers', v2.PrivateProviderListViewSet, base_name='private-providers')
router.register(r'list-provider-types', v2.ProviderTypeListViewSet, base_name='provider-types')
router.register(r'list-service-types', v2.ServiceTypeListViewSet, base_name='service-types')
router.register(r'list-services', v2.ServiceListViewSet, base_name='services')
router.register(r'list-regions', v2.GeographicRegionListViewSet, base_name='regions')
router.register(r'list-users', v2.UserListViewSet, base_name='user')

router.register(r'private-providers', v2.PrivateProviderViewSet)
router.register(r'private-services', v2.PrivateServiceViewSet)
router.register(r'provider-types', v2.ProviderTypeViewSet)  # incompatible with v1
router.register(r'providers', v2.ProviderViewSet)
router.register(r'providerslist', v2.ProviderListViewSet)
router.register(r'regions', v2.GeographicRegionViewSet)
router.register(r'service-areas', v2.ServiceAreaViewSet)
router.register(r'service-management', v2.ServiceViewSet)
router.register(r'service-tag', v2.ServiceTagViewSet)
router.register(r'service-types', v2.ServiceTypeViewSet)
router.register(r'services', v2.ServiceViewSet)
router.register(r'sites', v2.SiteViewSet)
router.register(r'users', v2.UserViewSet, base_name='user')

router.register(r'permission', v2.UserPermissionViewSet)

router.register(r'settings', v2.NewsletterEmailTemplateViewSet)

# See http://www.django-rest-framework.org/api-guide/routers/ for the
# URL names that DRF comes up with, to make it easy to reverse them.
urlpatterns = [
    # Wire up our API using automatic URL routing.
    url(r'^', include(router.urls)),

    url(r'^activate/$', view=v2.APIActivationView.as_view(), name='api-activate'),
    url(r'^blog/$', v2.BlogListAPIView.as_view()),
    url(r'^blog/(?P<id>.*)/pull/$', v2.BlogPullAPIView.as_view()),
    url(r'^blog/(?P<id>.*)/push/$', v2.BlogPushAPIView.as_view()),

    url(r'^newsletter-htmls', v2.NewsletterHtmlView.as_view())
]

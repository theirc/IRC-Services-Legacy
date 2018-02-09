from ..filters import NewsletterEmailTemplateFilter
from api.v2 import serializers as serializers_v2
from django.template.loader import render_to_string
from rest_framework import permissions, response
from rest_framework import viewsets, decorators
from rest_framework.views import APIView
from services.models import NewsletterEmailTemplate
from .utils import StandardResultsSetPagination



class NewsletterEmailTemplateViewSet(viewsets.ModelViewSet):
    filter_class = NewsletterEmailTemplateFilter
    queryset = NewsletterEmailTemplate.objects.all()
    serializer_class = serializers_v2.NewsletterEmailTemplateSerializer


class NewsletterHtmlView(APIView):

    queryset = NewsletterEmailTemplate.objects.all()

    def get(self, request, **kwargs):
        type = request.GET.get('type', 'base')
        if (type in [
                NewsletterEmailTemplate.SERVICE_BASE,
                NewsletterEmailTemplate.SERVICE_CONFIRMATION,
                NewsletterEmailTemplate.SERVICE_REMINDER, NewsletterEmailTemplate.SERVICE_THANKS]):
            newsletter_settings_type = type
        else:
            newsletter_settings_type = NewsletterEmailTemplate.SERVICE_BASE

        newsletter_settings = NewsletterEmailTemplate.objects.filter(type__in=[
            NewsletterEmailTemplate.SERVICE_BASE, newsletter_settings_type])
        newsletter_settings_list = list(newsletter_settings)
        for setting in newsletter_settings_list:
            if type == NewsletterEmailTemplate.SERVICE_BASE or \
                setting.type != NewsletterEmailTemplate.SERVICE_BASE:
                setting.value = "<div class='inline_setting newsletter_setting_{}'></div>" \
                    .format(setting.id)

        newsletter_settings_values = {x.name: x.value for x in newsletter_settings_list}
        content_html = render_to_string(
            'service_newsletter/'+type.replace('service_', '')+'.html',
            context={
                'newsletter_settings': newsletter_settings_values,
                'show_variables': True
            })
        return response.Response(content_html)

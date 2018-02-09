from django.views.generic import TemplateView

from service_info import settings

import json


class LandingPageView(TemplateView):

    template_name = 'admin_panel/index.html'

    def get_context_data(self, **kwargs):
        context = super(LandingPageView, self).get_context_data(**kwargs)
        context['WEB_CLIENT_URL'] = getattr(settings, 'WEB_CLIENT_URL', '')
        context['SERVICE_LANGUAGES'] = settings.LANGUAGES

        return context

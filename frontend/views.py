from django.views.generic import TemplateView
from service_info import settings
from rest_framework.authtoken.models import Token
from services.models import Provider
from django.contrib.auth.mixins import LoginRequiredMixin
from  django.contrib.sites.shortcuts import get_current_site
from django.views.generic import View
from django.http import HttpResponse
from django.conf import settings
from django.middleware.csrf import get_token

import os
import json
import hmac
import hashlib


class FrontendAppView(TemplateView):
    #template_name = 'build/index.html'
    #template_name = 'login.html'
    """
    Serves the compiled frontend entry point (only works if you have run `yarn
    run build`).
    """

    def get(self, request):
        try:
            with open(os.path.join(settings.REACT_APP_DIR, 'build', 'index.html')) as f:
                content = f.read()
                content = content.replace('csrf_token', get_token(request))
                return HttpResponse(content)
        except FileNotFoundError:
            logging.exception('Production build of app not found')
            return HttpResponse(
                """
                This URL is only used when you have built the production
                version of the app. Visit http://localhost:3000/ instead, or
                run `yarn run build` to test the production version.
                """,
                status=501,
            )

    
from django.views.generic import TemplateView
from service_info import settings
from rest_framework.authtoken.models import Token
from services.models import Provider
from django.contrib.auth.mixins import LoginRequiredMixin
from  django.contrib.sites.shortcuts import get_current_site
from django.views.generic import View
from django.http import HttpResponse, HttpResponseRedirect
from django.http import JsonResponse

from django.conf import settings
from django.middleware.csrf import get_token
from django.contrib.auth import authenticate, get_user_model
from django.contrib import messages
from django.core.urlresolvers import reverse_lazy


import os
import json
import hmac
import hashlib

class LoginView(TemplateView):
    template_name = "login.html"
 
    def get_context_data(self, **kwargs):
        context = super(LoginView, self).get_context_data(**kwargs)
        return  context
 
    def post(self, request, **kwargs):
        username = request.POST['username']
        password = request.POST['password']
        user = authenticate(username=username, password=password)
        if user:
            if user.is_active:
                #login(request, user)
                with open(os.path.join(settings.REACT_APP_DIR, 'build', 'index.html')) as f:
                    content = f.read()
                    content = content.replace('csrf_token', get_token(request))
                    return HttpResponse(content)
            else:
                messages.error(request, 'User inactive.', 'danger')
        else:
            messages.error(request, 'Invalid login credentials.', 'danger')
        
        context = self.get_context_data(**kwargs)
        return self.render_to_response(context)
 
    
    def logout_view(request):
        logout(request)
        return HttpResponseRedirect(reverse_lazy('accounts:login'))
    
    
    def get_landing_page(user):
        if user.is_superuser:
            return reverse_lazy('request:compliance_officer')
        if not user.is_superuser and hasattr(user, 'is_hradmin') and user.is_hradmin:
            return reverse_lazy('request:archived_requests')
        else:
            return reverse_lazy('request:request')
 

class FrontendAppView(LoginRequiredMixin, TemplateView):
    #template_name = 'build/index.html'
    template_name = 'login.html'
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

    
from django.views.generic import TemplateView
from service_info import settings
from rest_framework.authtoken.models import Token
from services.models import Provider
from django.contrib.auth.mixins import LoginRequiredMixin
from  django.contrib.sites.shortcuts import get_current_site

import json
import hmac
import hashlib


class LandingPageView(LoginRequiredMixin, TemplateView):
    login_url = '/login/'
    redirect_field_name = 'next'

    template_name = 'admin_panel/index.html'

    def get_context_data(self, **kwargs):
        context = super(LandingPageView, self).get_context_data(**kwargs)
        request = self.request
        user = request.user

        host = request.META['HTTP_HOST'].split(':')[0]
        SITE_CONFIG = getattr(settings, 'SITE_CONFIG', {})

        site_settings = SITE_CONFIG.get('all', {})
        for k in SITE_CONFIG.keys():
            if k in host:
                site_settings = SITE_CONFIG[k]
                if site_settings.get("CHAT_ENABLED", False):
                    digest = hmac.new(
                        # secret key (keep safe!)
                        site_settings['INTERCOM_SECRET'].encode('utf8'),
                        request.user.email.encode('utf8'),  # user's email address
                        digestmod=hashlib.sha256  # hash function
                    ).hexdigest()
                    site_settings['CHAT_DIGEST'] = str(digest)
                break

        context['WEB_CLIENT_URL'] = getattr(settings, 'WEB_CLIENT_URL', '')
        context['SERVICE_LANGUAGES'] = settings.LANGUAGES
        context['SITE_SETTINGS'] = site_settings

        token, x = Token.objects.get_or_create(user=user)
        token = {
            'token': token.key,
            'language': user.language,
            'email': user.email,
            'isStaff': user.is_staff,
            'isSuperuser': user.is_superuser,
            'name': user.name,
            'surname': user.surname,
            'id': user.id,
            'title': user.title,
            'position': user.position,
            'phone_number': user.phone_number,
            'site': {
                "id": user.site.id,
                "name": user.site.name,
                "domain": user.site.domain,
            } if user.site else {},
            'providers': [{"id": p.id, "name": p.name, "region": p.region.id if p.region else None} for p in user.all_providers],
            'groups': [{"id": p.id, "name": p.name} for p in user.groups.all()],
        }
        context['USER'] = json.dumps(token)

        selected_provider = None
        if 'selected-provider' in request.session:
            if request.session['selected-provider'] == 0:
                selected_provider = {}
            else:
                p = Provider.objects.get(pk=request.session['selected-provider'])            
            selected_provider = {
                'name': p.name,
                'id': p.id,
                'region': p.region.id if p.region else None}
        else:
            selected_provider = {}
            
        context['SELECTED_PROVIDER'] = json.dumps(selected_provider)
        context['PERMISSIONS'] = json.dumps({
            'email': user.email,
            'permissions': list(user.get_all_permissions())
        })

        context['REGION'] = 'false'

        if hasattr(request, 'region'):
            context['REGION'] = json.dumps({
                'id': request.region.id,
                'name': request.region.name,
                'languages_available': request.region.languages_available,
            })

        return context

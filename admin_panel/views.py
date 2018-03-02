from django.views.generic import TemplateView
from service_info import settings
from rest_framework.authtoken.models import Token
from services.models import Provider
import json


class LandingPageView(TemplateView):

    template_name = 'admin_panel/index.html'

    def get_context_data(self, **kwargs):
        request = self.request
        user = request.user

        context = super(LandingPageView, self).get_context_data(**kwargs)
        context['WEB_CLIENT_URL'] = getattr(settings, 'WEB_CLIENT_URL', '')
        context['SERVICE_LANGUAGES'] = settings.LANGUAGES

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
            'providers': [{"id": p.id, "name": p.name} for p in user.all_providers],
        }
        context['USER'] = json.dumps(token)

        selected_provider = None
        if 'selected-provider' in request.session:
            p = Provider.objects.get(pk=request.session['selected-provider'])
            selected_provider = {
                'name': p.name,
                'id': p.id
            }
        context['SELECTED_PROVIDER'] = json.dumps(selected_provider)
        context['PERMISSIONS'] = json.dumps({
            'email': user.email,
            'permissions': list(user.get_all_permissions())
        })

        return context

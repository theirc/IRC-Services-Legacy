from django.contrib.auth import authenticate, get_user_model
from email_user.models import EmailUser, token_generator
from django.core.exceptions import PermissionDenied

class CustomAuthenticationBackend(object):
    def authenticate(self, username=None, password=None):
        try:
            user = EmailUser.objects.get(email=username)  
            is_valid = user.check_password(password)
            if not is_valid:
                raise PermissionDenied
            providers = user.all_providers
            for prov in providers:                
                if prov.is_frozen:                                        
                    raise PermissionDenied  
            return user
        except EmailUser.DoesNotExist:
            raise PermissionDenied
    
    def get_user(self, user_id):
        try:
            return EmailUser.objects.get(pk=user_id)
        except EmailUser.DoesNotExist:
            return None
    
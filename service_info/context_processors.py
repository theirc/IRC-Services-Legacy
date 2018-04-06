
def site(request):
    from django.contrib.sites.shortcuts import get_current_site
    return {
        'site': get_current_site(request)
    }

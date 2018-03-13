from . import models


class UserRegionMiddleware(object):
    @staticmethod
    def process_request(request):
        user = request.user
        if not user.is_anonymous():
            providers = user.managed_providers.all() | user.providers.all()
            regions = providers.values_list('region').distinct()
            if not user.is_superuser and regions.count() == 1:
                region_id,  = regions.first()
                request.region = models.GeographicRegion.objects.get(
                    pk=region_id)


class RegionAttributesMiddleware(object):
    @staticmethod
    def process_request(request):
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        x_requested_for = request.META.get('HTTP_X_REQUESTED_FOR')
        x_requested_location = request.META.get('HTTP_X_REQUESTED_LOCATION')
        if x_requested_location:
            # We need to encrypt this at a later date

            from django.contrib.gis.geos import Point
            lat, long = [float(x.strip())
                         for x in x_requested_location.split(',')]
            point = Point(long, lat)
            regions = models.GeographicRegion.objects.filter(
                geom__contains=point)
            if regions:
                regions = sorted(regions, key=lambda r: r.level, reverse=True)
                region = regions[0]
                request.geo_region = region
                request.location_information = {
                    'latitude': lat,
                    'longitude': long,
                }
        else:
            if x_requested_for:
                ip = x_requested_for.split(',')[0]
            elif x_forwarded_for:
                ip = x_forwarded_for.split(',')[0]
            else:
                ip = request.META.get('REMOTE_ADDR')

            ip_information = models.IPGeoLocation.objects.find_by_ip(ip)
            region = models.IPGeoLocation.objects.find_region_by_ip(ip)

            request.ip_information = ip_information
            request.geo_region = region

import csv
from io import StringIO

import requests
from django.conf import settings
from django.core.management.base import BaseCommand

from regions import models


class Command(BaseCommand):
    """
    Imports data that was uploaded to box but originally from this website.


    http://dev.maxmind.com/geoip/geoip2/geolite2/

    GeoIPs don't need to be too accurate, just need to be within a region
    """
    help = 'Loads the CSV database of IP address from BOX by default, from a URL if overriden'

    def handle(self, *args, **options):
        ipv4_url = getattr(settings,
                           'GEO_IP_IPV4_URL',
                           'https://rescue.box.com/shared/static/lxkw426zcoc8l2325w7wo8g7gu7lvon2.csv')

        ipv6_url = getattr(settings,
                           'GEO_IP_IPV6_URL',
                           'https://rescue.box.com/shared/static/t8ojz8i7tidlmni49bgdms9gi5kg13dz.csv')

        if 'file://' in ipv4_url:
            url = ipv4_url[6:]
            with open(url) as f:
                lines = f.readlines()
            iterator = iter([a.encode('ascii') for a in lines])
        else:
            res = requests.get(ipv4_url, stream=True)
            iterator = res.iter_lines()

        header = next(iterator)
        for line in iterator:
            stream = StringIO()
            stream.write(header.decode("utf-8"))
            stream.write('\n')
            stream.write(line.decode("utf-8"))

            stream.seek(0)
            reader = csv.DictReader(stream)
            for row in reader:
                print(row)
                m, t = models.IPGeoLocation.objects.get_or_create(
                    network=row['network'] if row['network'] else 0,
                )
                models.IPGeoLocation.objects.filter(id=m.id).update(
                    network=row['network'] if row['network'] else 0,
                    geoname_id=row['geoname_id'] if row['geoname_id'] else 0,
                    registered_country_geoname_id=row['registered_country_geoname_id'] if row[
                        'registered_country_geoname_id'] else 0,
                    represented_country_geoname_id=row['represented_country_geoname_id'] if row[
                        'represented_country_geoname_id'] else 0,
                    is_anonymous_proxy=row['is_anonymous_proxy'] if row['is_anonymous_proxy'] else 0,
                    is_satellite_provider=row['is_satellite_provider'] if row['is_satellite_provider'] else 0,
                    postal_code=row['postal_code'] if row['postal_code'] else None,
                    latitude=row['latitude'] if row['latitude'] else None,
                    longitude=row['longitude'] if row['longitude'] else None,
                    type='v4',
                )

        res = requests.get(ipv6_url, stream=True)
        iterator = res.iter_lines()
        header = next(iterator)
        for line in iterator:
            stream = StringIO()
            stream.write(header.decode("utf-8"))
            stream.write('\n')
            stream.write(line.decode("utf-8"))

            stream.seek(0)
            reader = csv.DictReader(stream)
            for row in reader:
                print(row)
                m, t = models.IPGeoLocation.objects.get_or_create(
                    network=row['network'] if row['network'] else 0,
                )
                models.IPGeoLocation.objects.filter(id=m.id).update(
                    geoname_id=row['geoname_id'] if row['geoname_id'] else 0,
                    registered_country_geoname_id=row['registered_country_geoname_id'] if row[
                        'registered_country_geoname_id'] else 0,
                    represented_country_geoname_id=row['represented_country_geoname_id'] if row[
                        'represented_country_geoname_id'] else 0,
                    is_anonymous_proxy=row['is_anonymous_proxy'] if row['is_anonymous_proxy'] else 0,
                    is_satellite_provider=row['is_satellite_provider'] if row['is_satellite_provider'] else 0,
                    postal_code=row['postal_code'] if row['postal_code'] else None,
                    latitude=row['latitude'] if row['latitude'] else None,
                    longitude=row['longitude'] if row['longitude'] else None,
                    type='v6',
                )

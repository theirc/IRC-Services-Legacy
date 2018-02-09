import itertools
import uuid

import functools
from django.contrib.gis import geos
from django.contrib.gis.db import models
from django.db.models import Q
from django.utils.translation import ugettext_lazy as _, get_language

from email_user.models import EmailUser
from services.meta import TranslatableModel
from . import utils

def default_authentication_token():
    return str(uuid.uuid4())


class ContentFetchingMixin(object):
    def page_data(self, language='en'):
        return None

    def content(self, language='en'):
        return None

    def metadata(self, language='en'):
        return None


class __ContentFetchingMixin(object):
    def page_data(self, language='en'):
        system_language = get_language()
        if system_language:
            language = system_language[:2]

        page = utils.fetch_content(self.uri, language)

        return page

    def content(self, language='en'):
        def sort_inherited(p):
            if 'important' in p and p['important']:
                if 'inherited' not in p or not p['inherited']:
                    return -1
                else:
                    return 0

            if 'inherited' in p and p['inherited']:
                if 'position_hierarchy' in p and p['position_hierarchy'] == 'U':
                    return 1
                else:
                    return 3

            return 2

        page = self.page_data(language)['content']
        for p in page:
            p['inherited'] = False

        parents = [x.page_data(language) for x in self.parents]
        parents = [x['content'] for x in parents if 'content' in x]
        parents = [list(filter(lambda x: 'inherited' in x and x['inherited'], (p or []))) for p in parents]
        parents.append(page)

        page = functools.reduce(lambda a, b: (a or []) + (b or []), parents, [])
        page = sorted(page, key=sort_inherited)

        for i, k in enumerate(page):
            k['index'] = i

        return page

    def metadata(self, language='en'):
        import functools
        parents = [x.page_data(language) for x in self.parents]
        parents = [x['metadata']['banners'] for x in parents if 'metadata' in x and 'banners' in x['metadata']]

        metadata = self.page_data(language)['metadata']

        metadata['banners'] = functools.reduce(lambda a, b: (a or []) + (b or []), parents, []) + (
            metadata['banners'] if 'banners' in metadata else []
        )

        return metadata


class GeographicRegion(TranslatableModel, models.Model, ContentFetchingMixin):
    """Common model to represent levels 1, 2, 3"""
    __translatable__ = {
        "title": lambda l: models.CharField(
            _("Title in {LANGUAGE_NAME}".format(**l)),
            max_length=256,
            default='',
            blank=True,
        ),
    }

    level = models.IntegerField(
        choices=[
            (1, _('Country')),
            (2, _('Region')),
            (3, _('City')),
        ]
    )
    geom = models.MultiPolygonField(srid=4326)
    parent = models.ForeignKey('self', related_name='children', null=True, blank=True)
    name = models.CharField(max_length=256, default='')

    slug = models.CharField(max_length=100, default='')
    code = models.CharField(max_length=16, blank=True)

    hidden = models.BooleanField(default=False)

    languages_available = models.CharField(
        max_length=300,
        blank=True,
        help_text=_('Comma separated values of languages available in this region')
    )
    restrict_access_to = models.TextField(
        null=True,
        blank=True,
        help_text=_('Comma separated values of code of siblings visible from this region')
    )
    objects = models.GeoManager()

    def __str__(self):
        return "%s %s" % (self.get_level_display(), self.name)

    @property
    def centroid(self):
        return self.geom.centroid

    @property
    def depth(self):
        return len(list(self.parents))

    @property
    def parents(self):
        me = self
        while me.parent:
            me = me.parent

            yield me

    @property
    def important_information(self):
        pages = [{
                     "id": p.page.id,
                     "slug": p.page.slug,
                     "code": p.page.slug,
                     "title": p.page.title,
                     "name": p.page.title,
                     "hidden": False,
                     "metadata": {"page_title": p.page.title,},
                     "content": [{
                         "vector_icon": p.page.icon,
                         "hide_from_toc": p.page.pop_up,
                         "section": p.page.html(),
                         "metadata": {},
                         "title": p.page.title,
                         "important": False,
                         "anchor_name": p.page.slug,
                         "index": i,
                         "inherited": False,
                     }] + [{
                               "vector_icon": "",
                               "hide_from_toc": True,
                               "section": sp['html'],
                               "metadata": {
                                   "page_title": sp['title']
                               },
                               "title": sp['title'],
                               "important": False,
                               "anchor_name": sp['slug'],
                               "index": z,
                               "inherited": False,
                           } for z, sp in enumerate(p.page.get_sub_sections())
                           ]
                 } for i, p in enumerate(self.pages_with_order.filter(page__important=True).order_by('index'))]
        return pages

    @property
    def full_slug(self):
        return "--".join(reversed([self.slug] + [p.slug for p in self.parents]))

    @property
    def uri(self):
        return "/".join(reversed([self.slug] + [p.slug for p in self.parents if p.level != 2])) + '/'

    def get_all_languages(self):
        return set([])

    def get_sections(self, language='en', environment='production'):
        pages = [{
                     "vector_icon": p.page.icon,
                     "hide_from_toc": p.page.pop_up,
                     "section": p.page.html(language),
                     "metadata": {
                         "page_title": p.page.title
                     },
                     "title": p.page.title,
                     "important": False,
                     "anchor_name": p.page.slug,
                     "index": i,
                     "inherited": False,
                 } for i, p in enumerate(
            self.pages_with_order.filter(page__important=False, page__banner=False, page__status=environment).order_by(
                'index'))]

        page_like_objects = [
            [
                {
                    "vector_icon": "",
                    "hide_from_toc": True,
                    "section": sp['html'],
                    "metadata": {
                        "page_title": sp['title']
                    },
                    "title": sp['title'],
                    "important": False,
                    "anchor_name": sp['slug'],
                    "index": i,
                    "inherited": False,
                }
                for i, sp in enumerate(p.page.get_sub_sections(language))
                ]
            for p in self.pages_with_order.filter(page__important=False, page__banner=False, page__status=environment)
            ]
        return pages + list(itertools.chain.from_iterable(page_like_objects))

    def get_sub_pages(self, environment='production'):
        pages = [{
                     "id": p.page.id,
                     "slug": p.page.slug,
                     "code": p.page.slug,
                     "title": p.page.title,
                     "name": p.page.title,
                     "hidden": False,
                     "metadata": {"page_title": p.page.title,},
                     "content": [{
                         "vector_icon": p.page.icon,
                         "hide_from_toc": p.page.pop_up,
                         "section": p.page.html(),
                         "metadata": {},
                         "title": p.page.title,
                         "important": False,
                         "anchor_name": p.page.slug,
                         "index": i,
                         "inherited": False,
                     }] + [{
                               "vector_icon": "",
                               "hide_from_toc": True,
                               "section": sp['html'],
                               "metadata": {
                                   "page_title": sp['title']
                               },
                               "title": sp['title'],
                               "important": False,
                               "anchor_name": sp['slug'],
                               "index": z,
                               "inherited": False,
                           } for z, sp in enumerate(p.page.get_sub_sections())
                           ]
                 } for i, p in enumerate(
            self.pages_with_order.filter(page__important=True, page__banner=False, page__status=environment).order_by(
                'index'))]
        return pages

    def metadata(self, language='en', environment='production'):
        banners = self.pages_with_order.filter(page__banner=True, page__status=environment)
        return {
            "banners": [p.page.html() for p in banners],
            "page_title": self.title
        }

    def get_all_children(self):
        return GeographicRegion.objects.filter(Q(parent=self) | Q(parent__parent=self) | Q(id=self.id))

    class Meta:
        ordering = ['level', 'name']


class ImportantInformation(TranslatableModel, models.Model, ContentFetchingMixin):
    """
    Model to reflect the content available in the platform that may or may not be tied to a geographic location
    """
    __translatable__ = {
        "title": lambda l: models.CharField(
            _("Title in {LANGUAGE_NAME}".format(**l)),
            max_length=256,
            default='',
            blank=True,
        ),
    }
    region = models.ForeignKey(GeographicRegion, related_name='+', null=True, blank=True)
    name = models.CharField(max_length=256, blank=True)

    slug = models.CharField(max_length=100, blank=True, null=True)
    code = models.CharField(max_length=16, blank=True, help_text=_('Used to sort the important information'))

    icon = models.CharField(max_length=256, blank=True, null=True)
    hidden = models.BooleanField(default=False)

    @property
    def parents(self):
        if self.region:
            yield self.region

            for p in self.region.parents:
                if p.level != 2:
                    yield p

    @property
    def full_slug(self):
        return "--".join(reversed([self.slug] + [p.slug for p in self.parents]))

    @property
    def uri(self):
        return "/".join(reversed([self.slug] + [p.slug for p in self.parents])) + '/'

    def content(self, language='en'):
        return []


class IPGeoLocationManager(models.Manager):
    def find_by_ip(self, ip):
        import textwrap
        import ipaddress
        if ':' in ip:
            # v6
            separator = ':'
            ip_type = 'v6'
            ip = ipaddress.IPv6Address(ip).exploded
            bits = "".join(["{0:08b}".format(int(x, 16)) for x in ip.split(separator)])
        else:
            separator = '.'
            ip_type = 'v4'
            ip = ipaddress.IPv4Address(ip).exploded
            bits = "".join(["{0:08b}".format(int(x)) for x in ip.split(separator)])

        all_networks = []
        for a in range(0, len(bits)):
            if ip_type == 'v4':
                ip_network = [str(int(b, 2)) for b in textwrap.wrap(bits[0:a].ljust(32, '0'), 8)]
            else:
                ip_network = [str(int(b, 2)) for b in textwrap.wrap(bits[0:a].ljust(128, '0'), 16)]

            all_networks.append("{}/{}".format(separator.join(ip_network), str(a)))

        all_networks = reversed(all_networks)
        qs = self.get_queryset().filter(network__in=all_networks, type=ip_type)
        if not qs:
            return None

        if qs:
            return qs[0]

    def find_region_by_ip(self, ip):
        network = self.find_by_ip(ip)

        if not network:
            return None
        point = geos.Point(float(network.longitude), float(network.latitude), srid=4326)
        regions = GeographicRegion.objects.filter(geom__contains=point)

        if not regions:
            return None

        regions = sorted(regions, key=lambda r: r.level, reverse=True)

        return regions[0]


class IPGeoLocation(models.Model):
    """
    Map of IP addresses and country. Does not need to be that accurate.

    Source: http://dev.maxmind.com/geoip/geoip2/geolite2/

    Data from CSV
    network,geoname_id,registered_country_geoname_id,represented_country_geoname_id,is_anonymous_proxy,is_satellite_provider,postal_code,latitude,longitude
    """
    network = models.CharField(max_length=50, blank=True, null=True, db_index=True)
    geoname_id = models.IntegerField(default=0)
    registered_country_geoname_id = models.IntegerField(default=0)
    represented_country_geoname_id = models.IntegerField(default=0)
    is_anonymous_proxy = models.NullBooleanField(default=False)
    is_satellite_provider = models.NullBooleanField(default=False)
    postal_code = models.CharField(max_length=50, blank=True, null=True)
    latitude = models.DecimalField(max_digits=17, decimal_places=14, default=0, null=True)
    longitude = models.DecimalField(max_digits=17, decimal_places=14, default=0, null=True)
    type = models.CharField(max_length=2, choices=(('v4', 'IPV4'), ('v6', 'IPV6'),), default='v4')

    objects = IPGeoLocationManager()


class ContentRate(models.Model):
    region = models.ForeignKey(GeographicRegion, null=True, blank=True)
    content_index = models.IntegerField(null=True, blank=True)
    content_slug = models.CharField(max_length=250, null=True, blank=True)
    thumbs_up = models.PositiveIntegerField(default=0)
    thumbs_down = models.PositiveIntegerField(default=0)

    class Meta:
        unique_together = ('region', 'content_index', 'content_slug')

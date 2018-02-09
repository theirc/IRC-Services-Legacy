import json
import os
import shutil
import tarfile
import tempfile
from io import BytesIO

import requests
import xmltodict
from django.contrib.gis import geos
from django.core.management.base import BaseCommand
from django.utils.text import slugify

from regions import models


class Command(BaseCommand):
    help = 'Load GeoJSON and gets the location out of it'

    def handle(self, *args, **options):
        feature_index = 'q'
        features = []
        locations = []

        while feature_index.lower() == 'q':
            original_url = 'https://s3.amazonaws.com/osm-polygons.mapzen.com/'
            countries = requests.get(original_url).text
            countries = xmltodict.parse(countries)

            for i, c in enumerate(countries['ListBucketResult']['Contents'][1:], start=1):
                print("{}: {}".format(i, c['Key']))

            print("Press <return> to exit\n")
            country_index = input('Enter selected country: ')
            if not country_index:
                return

            selected = countries['ListBucketResult']['Contents'][int(country_index)]
            response = requests.get(original_url + selected['Key'])

            tar_file = tarfile.open(mode='r:gz', fileobj=BytesIO(response.content))

            tmpdir = tempfile.mkdtemp()
            tar_file.extractall(tmpdir)

            json_file_path = os.path.join(tmpdir, os.listdir(tmpdir)[0])
            all_files = sorted(os.listdir(json_file_path))

            for i, f in enumerate(all_files, start=1):
                file_size = os.path.getsize(os.path.join(json_file_path, f))
                print("{}: {} ({})".format(i, f, file_size))

            print("Press Q to restart and <return> to exit\n")
            level_index = input('Enter selected file: ')
            if level_index.lower() == 'q':
                continue

            if not level_index:
                return

            selected_file = all_files[int(level_index) - 1]
            with open(os.path.join(json_file_path, selected_file)) as f:
                current_json = f.read()

            content = json.loads(current_json)
            features = content['features']

            shutil.rmtree(tmpdir)

            locations = sorted([a for a in features if 'name' in a['properties']],
                               key=lambda x: x['properties']['name'])

            for i, l in enumerate(locations):
                print("{}: {} ({})".format(i + 1, l['properties']['name:en'] if 'name:en' in l['properties'] else '',
                                           l['properties']['name']))

            print("Press Q to restart and <return> to exit\n")
            feature_index = input('Enter selected feature: ')
            if not feature_index:
                return

        if not features or not locations:
            return

        if feature_index.lower() == 'all':
            to_be_merged = [geos.GEOSGeometry(json.dumps(a['geometry'])) for a in features]
            polys = []
            for p in to_be_merged:
                if type(p) == geos.Polygon:
                    polys.append(p)
                elif type(p) == geos.MultiPolygon:
                    polys = polys + list(p)
            feature = geos.MultiPolygon(polys)

        elif ',' in feature_index:
            indices = [int(a) for a in feature_index.split(',')]
            to_be_merged = [geos.GEOSGeometry(json.dumps(locations[a - 1]['geometry'])) for a in indices]
            polys = []
            for p in to_be_merged:
                if type(p) == geos.Polygon:
                    polys.append(p)
                elif type(p) == geos.MultiPolygon:
                    polys = polys + list(p)
            feature = geos.MultiPolygon(polys)

        else:
            feature_index = int(feature_index)
            print(locations[feature_index - 1]['properties']['name'])

            feature_json = json.dumps(locations[feature_index - 1]['geometry'])

            feature = geos.GEOSGeometry(feature_json)

        is_new_location = input('Is this a new location? (y/N) ')
        is_new_location = True if 'Y' in is_new_location.upper() else False

        # merged = feature.convex_hull if len(feature) > 3 else feature[0]
        # merged = merged.simplify(tolerance=0.01, preserve_topology=True)

        if is_new_location:
            location_name = input('Name of location: ')
            area_type = input('Area Type (1: Country; 2: Region): [1/2] ') or '1'
            area_type = int(area_type)
            location_slug = slugify(location_name)
            parent_id = input('Parent Id: ')
            location = models.GeographicRegion.objects.create(
                name=location_name,
                parent_id=int(parent_id) if parent_id else None,
                geom=feature,
                level=area_type,
                slug=location_slug,
            )
        else:
            location_id = input('Location Id: ')
            location = models.GeographicRegion.objects.get(id=int(location_id))
            location.geom = feature
            location.save()

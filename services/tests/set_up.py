from django.contrib.auth.models import Group, Permission
from django.contrib.contenttypes.models import ContentType
from django.contrib.gis.geos import GEOSGeometry, MultiPolygon

from regions.models import GeographicRegion
from services.models import ServiceType, ServiceArea, Nationality, ProviderType
from services.utils import permission_names_to_objects

# Permissions needed by staff
# Permission names are "applabel.action_lowercasemodelname"
STAFF_PERMISSIONS = [
    'services.change_provider',
    'services.change_service',
    'services.change_selectioncriterion',
]

# Typical provider permissions
PROVIDER_PERMISSIONS = [
    'services.add_provider',
    'services.change_provider',
    'services.add_service',
    'services.change_service',
    'services.add_selectioncriterion',
    'services.change_selectioncriterion',
]


def create_mock_data():
    group, unused = Group.objects.get_or_create(name='Staff')
    group.permissions.add(*permission_names_to_objects(STAFF_PERMISSIONS, Permission, ContentType))

    group, unused = Group.objects.get_or_create(name='Providers')
    group.permissions.add(*permission_names_to_objects(PROVIDER_PERMISSIONS, Permission, ContentType))

    romania = """{
        "type": "Polygon",
        "coordinates": [
          [
            [
              26.82861328125,
              48.180738507303836
            ],
            [
              26.202392578124996,
              48.04136507445029
            ],
            [
              25.37841796875,
              47.82053186746053
            ],
            [
              24.488525390625,
              47.73932336136854
            ],
            [
              23.389892578124996,
              47.908978314728685
            ],
            [
              22.445068359375,
              47.79839667295524
            ],
            [
              21.522216796875,
              46.717268685073954
            ],
            [
              20.63232421875,
              46.042735653846506
            ],
            [
              20.863037109375,
              45.73685954736049
            ],
            [
              21.357421875,
              45.336701909968106
            ],
            [
              21.4892578125,
              44.8324999934906
            ],
            [
              21.895751953125,
              44.629573191951046
            ],
            [
              22.47802734375,
              44.74673324024678
            ],
            [
              22.884521484375,
              44.35527821160296
            ],
            [
              23.038330078125,
              44.01652134387754
            ],
            [
              23.653564453125,
              43.874138181474734
            ],
            [
              24.620361328125,
              43.731414013769
            ],
            [
              25.576171875,
              43.70759350405294
            ],
            [
              26.334228515625,
              44.040218713142146
            ],
            [
              27.31201171875,
              44.174324837518924
            ],
            [
              27.79541015625,
              44.142797828180605
            ],
            [
              28.443603515625,
              43.810747313446996
            ],
            [
              28.894042968749996,
              44.41024041296011
            ],
            [
              29.619140624999996,
              44.96479793033104
            ],
            [
              28.9599609375,
              45.321254361171476
            ],
            [
              28.32275390625,
              45.182036837015886
            ],
            [
              27.94921875,
              45.55252525134013
            ],
            [
              27.927246093749996,
              46.08847179577592
            ],
            [
              28.19091796875,
              46.5286346952717
            ],
            [
              27.410888671874996,
              47.56170075451973
            ],
            [
              27.059326171875,
              48.03401915864286
            ],
            [
              26.82861328125,
              48.180738507303836
            ]
          ]
        ]
}"""
    g_romania = GEOSGeometry(romania, srid=4326)
    bucharest = """ {
        "type": "Polygon",
        "coordinates": [
          [
            [
              26.16668701171875,
              44.535674532413196
            ],
            [
              25.94970703125,
              44.54742015866826
            ],
            [
              25.91949462890625,
              44.3768766587829
            ],
            [
              26.1199951171875,
              44.34742225636393
            ],
            [
              26.188659667968746,
              44.422011314236634
            ],
            [
              26.16668701171875,
              44.535674532413196
            ]
          ]
        ]
}"""
    g_bucharest = GEOSGeometry(bucharest, srid=4326)
    m_romania, unused = GeographicRegion.objects.get_or_create(geom=MultiPolygon([g_romania,]), level=1, name="Romania", slug="romania")
    m_bucharest, unused = GeographicRegion.objects.get_or_create(
        geom=MultiPolygon([g_bucharest,]),
        level=3,
        name="Bucharest",
        slug="bucharest",
        parent=m_romania
    )

    ServiceArea.objects.get_or_create(geographic_region=m_bucharest, name_en='1')
    ServiceArea.objects.get_or_create(geographic_region=m_bucharest, name_en='2')
    ServiceType.objects.update_or_create(number=1, defaults={'name_en': 'Type', 'vector_icon': 'fa fa-home'})
    ServiceType.objects.update_or_create(number=2, defaults={'name_en': 'Type', 'vector_icon': 'fa fa-home'})
    ProviderType.objects.get_or_create(name_en='Type', number=1)
    ProviderType.objects.get_or_create(name_en='Type', number=2)
    Nationality.objects.get_or_create(name_en='Syrian', number=1)
    Nationality.objects.get_or_create(name_en='Iraqi', number=2)

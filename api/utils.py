from django.conf import settings
from rest_framework.response import Response
import json


def generate_translated_fields(field, include_original_field=True):
    """
    Generate the list of the fields in all languages in the system.
    :param include_original_field: Whether to include the original auto-translate field
    :param field: Name of the translated field
    :return: All fields + _ + language code
    """
    fields = [field] if include_original_field else []
    for k, v in settings.LANGUAGES:
        fields.append("{}_{}".format(field, k))

    return fields

def format_opening_hours(opening_hours):
    hours = json.loads(opening_hours)
    weekdays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    s = ''

    if hours['24/7']:
        s += '24/7: yes'
    else:
        for day in weekdays:
            s += day.capitalize() + ': ' + hours[day][0]['open'][0:-3] + ' (open) - ' + hours[day][0]['close'][0:-3] + ' (close) | ' if hours[day][0]['open'] else ''

    return s
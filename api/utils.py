from django.conf import settings
from rest_framework.response import Response


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


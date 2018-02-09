from django import template

register = template.Library()


@register.filter(is_safe=True)
def get_item(dictionary, key):
    return dictionary.get(key)

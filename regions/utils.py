import json

import requests
from bs4 import BeautifulSoup
from django.conf import settings
from django.core.cache import cache

session = requests.Session()


def fetch_content(uri, language='en', clear=False):
    """
    Downloads the content for this location from the CMS.

    :param uri: URI generated from the metadata for the location
    :param language: Language for the text
    :param clear: Overrides the cache if true
    :return: String containing either an HTML or a JSON representation of the content
    """
    if not uri or not settings.CMS_URL:
        return None
    language = language or 'en'  # It really needs to fallback to english
    cache_key = "{}://{}/{}".format('json', uri, language)
    content_url = "{}/{}/{}/{}".format(settings.CMS_URL, language, settings.CMS_ENVIRONMENT, uri)

    cached = cache.get(cache_key)
    if cached and not clear:
        return json.loads(cached)

    c = session.get(content_url,)

    raw_content = c.text
    soup = BeautifulSoup(raw_content, 'lxml')
    content = soup.select('.cms-content')

    """
    This iterates through all of the elements and removes all of their styles attribute.

    Given that we are talking about 3 different UIs presenting the same data, we will have to standardize to use a mix
    of CSS classes and tags.
    """
    for t in soup.select('[style]'):
        if 'style' in t.attrs:
            del t.attrs['style']

    """
    Removing the table attributes that do nothing but screw up layouting in any of the UIs
    border bordercolor cellpadding cellspacing
    """
    for t in soup.select('[bordercolor], [border], [cellpadding], [cellspacing]'):
        if 'bordercolor' in t.attrs:
            del t.attrs['bordercolor']

        if 'border' in t.attrs:
            del t.attrs['border']

        if 'cellpadding' in t.attrs:
            del t.attrs['cellpadding']

        if 'cellspacing' in t.attrs:
            del t.attrs['cellspacing']

    if content:
        content = content[0]
    else:
        dummy_cache = json.dumps({'content': [], 'metadata': {}})
        cache.set(cache_key, dummy_cache, None)
        return json.loads(dummy_cache)

    # Lightly parses content into JSON
    parsed = json.dumps(_generate_json(content, soup))

    cache.set(cache_key, parsed, None)

    return json.loads(parsed)


def _generate_json(content, soup):
    """
    Takes in soup object, and breaks it apart by taking out the headers and getting the siblings between headers and
    assumes they belong in the same section
    :param content:
    :return:
    """
    last_updated = content.select('.last-updated')
    if last_updated:
        last_updated = last_updated[0].attrs['data-date']
    else:
        last_updated = ''

    page_title = content.select('.page-title')
    if page_title:
        page_title = page_title[0]

    banners = list(_get_banners(page_title))

    headers = content.select('.section-header')
    # Break up content by headers
    parsed = []
    for i, h in enumerate(headers):
        header_title = h.find('a')
        header_title = header_title.text if header_title else ''

        header_image = h.find('img')
        header_image = header_image.attrs['src'] if header_image else ''

        header_metadata = h.attrs['data-metadata'] if 'data-metadata' in h.attrs else ''
        header_position_hierarchy = h.attrs['data-position-hierarchy'] if 'data-position-hierarchy' in h.attrs else ''
        header_vector_icon = h.attrs['data-vector-icon'] if 'data-vector-icon' in h.attrs else ''
        header_anchor_name = h.attrs['data-anchor-name'] if 'data-anchor-name' in h.attrs else ''
        header_hide_from_toc = h.attrs['data-hide-from-toc'] if 'data-hide-from-toc' in h.attrs else ''
        header_important = 'class' in h.attrs and 'important' in h.attrs['class']
        header_inherited = 'class' in h.attrs and 'inherited' in h.attrs['class']

        # Go through headers and find all the siblings that are not section headers as well
        section_list = list(_not_header(h, [x for x in headers if x != h]))

        section_list = [parse_html_element(h, soup) for h in section_list]

        parsed.append({
            "index": i,
            "title": header_title,
            "image": header_image,
            "position_hierarchy": header_position_hierarchy,
            "vector_icon": header_vector_icon,
            "anchor_name": header_anchor_name,
            "hide_from_toc": not not header_hide_from_toc,
            "metadata": header_metadata,
            "important": header_important,
            "inherited": header_inherited,
            "section": "".join([str(s) for s in section_list]),
        })

    return {
        'content': parsed,
        'metadata': {
            'last_updated': last_updated,
            'page_title': page_title.text,
            'banners': ["".join(["".join([str(c) for c in b.children])]) for b in banners]
        }
    }


def parse_html_element(e, soup):
    if e.name == 'table':
        wrapper = soup.new_tag('div', **{"class": "table-responsive"})
        t = e.wrap(wrapper)
        return t
    return e


def _generate_html(content):
    """
    For now, just stringifies the soup object that comes in from the CMS.
    :param content:
    :return:
    """
    # Nothing to see here, yet:
    return str(content)


def _not_header(el, headers):
    """
    Returns all sibling elements, but stops once it finds a new header
    :param el:
    :return:
    """
    i = el.next_sibling
    while i is not None:
        if i in headers:
            break

        yield i
        i = i.next_sibling


def _get_banners(el):
    i = el.next_sibling
    while i is not None:
        if i.name == 'table':
            break
        if i.name == 'div':
            yield i
        i = i.next_sibling


def chunks(l, n):
    """Yield successive n-sized chunks from l."""
    for i in range(0, len(l), n):
        yield l[i:i + n]

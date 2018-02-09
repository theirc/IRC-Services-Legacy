from __future__ import absolute_import, unicode_literals, division, print_function

import json
from html import unescape

import re
import requests
from bs4 import BeautifulSoup
from celery.utils.log import get_task_logger
from collections import OrderedDict
from django.conf import settings
from django.template.loader import render_to_string
from django.utils import timezone
from lxml import etree
from lxml.cssselect import CSSSelector
from six import StringIO
from tablib.compat import unicode

logger = get_task_logger(__name__)


def swap_element(new, old):
    parent = old.getparent()
    index = parent.index(old)
    new.tail = old.tail
    old.tail = None

    parent.insert(index, new)
    parent.remove(old)


def swap_element_inbound(new, old):
    parent = old.getparent()
    if parent.tag == 'div' and 'data-id' in parent.attrib:
        p = old.getprevious()
        new.tail = old.tail
        old.tail = None

        p.append(new)
        parent.remove(old)
    else:
        index = parent.index(old)
        new.tail = old.tail
        old.tail = None

        parent.insert(index, new)
        parent.remove(old)


def parse_html_for_translation(html):
    """
    Preprocessing function that takes in HTML and preps it for translations.

    Anchors are removed, phone numbers are prepped, and other HTML quirks gets fixed before going to transifex.
    :param html: raw HTML to be sent to Transifex
    :return: processed HTML
    """
    p = re.compile(r'<.*?>')
    if p.findall(html):
        html = unicode(BeautifulSoup(html, "lxml").prettify())
        parser = etree.HTMLParser()
        tree = etree.parse(StringIO(html), parser)
        a = CSSSelector('a')
        translatable_a = CSSSelector('a.translatable')
        img = CSSSelector('img:not(.image-translatable)')

        # Translatable anchors are split into text and links
        anchors = translatable_a(tree.getroot())
        logger.info(str(anchors))

        for anchor in anchors:
            attributes = [("data-a-{}".format(k), v) for k, v in dict(anchor.attrib).items()]
            div = etree.Element('div')

            content = etree.parse(
                StringIO("<div class=\"text\">{}</div>".format(stringify_children(anchor)))).getroot()
            href_format = """<div class=\"href\">{}</div>"""
            href_html = fix_html_fragment(href_format.format(anchor.attrib['href']))

            link = etree.parse(StringIO(href_html)).getroot()

            for k, v in attributes:
                div.attrib[k] = v

            div.attrib['class'] = 'former-anchor-translatable'
            div.append(content)
            div.append(link)

            swap_element(div, anchor)

        # Anchors are just the text
        anchors = a(tree.getroot())
        for anchor in anchors:
            attributes = [("data-a-{}".format(k), v) for k, v in dict(anchor.attrib).items()]

            anchor_format = "<div class=\"former-anchor\">{}</div>"
            anchor_html = fix_html_fragment(anchor_format.format(stringify_children(anchor)))

            div = etree.parse(StringIO(anchor_html)).getroot()

            for k, v in attributes:
                div.attrib[k] = v

            swap_element(div, anchor)

        # Images are just copies of the attributes
        images = img(tree.getroot())
        for image in images:
            div = etree.Element('div')
            attributes = [("data-img-{}".format(k), v) for k, v in dict(image.attrib).items()]

            for k, v in attributes:
                div.attrib[k] = v
            div.attrib['class'] = 'former-image'

            swap_element(div, image)

        """
        b_objects = CSSSelector('b, strong')(tree.getroot())
        for b in b_objects:
            attributes = [("data-strong-{}".format(k), v) for k, v in dict(b.attrib).items()]
            div = etree.parse(
                StringIO("<div>{}</div>".format(stringify_children(b)))).getroot()

            for k, v in attributes:
                div.attrib[k] = v

            div.attrib['class'] = 'former-strong'

            if b.getparent().tag == 'p' and len(b.getparent().getchildren()) == 1:
                # this is an only child, so lets replace the parent intead
                swap_element(div, b.getparent())
            else:
                swap_element(div, b)

        em_objects = CSSSelector('i, em')(tree.getroot())
        for em in em_objects:
            attributes = [("data-em-{}".format(k), v) for k, v in dict(em.attrib).items()]
            div = etree.parse(
                StringIO("<div>{}</div>".format(stringify_children(em)))).getroot()

            for k, v in attributes:
                div.attrib[k] = v

            div.attrib['class'] = 'former-em'

            if em.getparent().tag == 'p' and len(em.getparent().getchildren()) == 1:
                # this is an only child, so lets replace the parent intead
                swap_element(div, em.getparent())
            else:
                swap_element(div, em)
        """
        html = etree.tostring(tree).decode('utf-8')

    # Chicken coop de grass
    # Massive regex that takes in phone numbers and puts them in divs
    # only to be postprocessed below and dissapear from the translations
    p = re.compile(r'((?:\+\s*)*\d+(?:\s+\(*\d+\)*)*\d+(?:\s+\d+\(*\)*)+|\d+(?:\s+\d+)+|00\d+(?:\s+\d+)+)')
    html = p.sub('<div class="former-tel">\g<1></div>', html)

    soup = BeautifulSoup(html, "lxml")
    for div in soup.find_all('div'):
        tag_format = None
        while div.parent and div.parent.name in ['b', 'em', 'i', 'strong', 'u', 'sup']:
            if div.parent.name == "b":
                div.parent.unwrap()
                tag_format = "<b>{}</b>"
            if div.parent.name == "strong":
                div.parent.unwrap()
                tag_format = "<strong>{}</strong>"
            if div.parent.name == "em":
                div.parent.unwrap()
                tag_format = "<em>{}</em>"
            if div.parent.name == "i":
                div.parent.unwrap()
                tag_format = "<i>{}</i>"
            if div.parent.name == "u":
                div.parent.unwrap()
                tag_format = "<u>{}</u>"
            if div.parent.name == "sup":
                div.parent.unwrap()
                tag_format = "<sup>{}</sup>"

            if tag_format:
                children = "".join([unicode(c) for c in div.contents])
                div.clear()

                child_soup = BeautifulSoup(tag_format.format(children), "lxml")
                if child_soup.body:
                    child_frag = child_soup.body.next
                elif child_soup.html:
                    child_frag = child_soup.html.next
                else:
                    child_frag = child_soup
                div.append(child_frag)

    for n in soup.select('u, b, i, em, strong, sup'):
        if not n.text.strip():
            n.extract()

    for tel in soup.select('div.former-tel'):
        number = tel.text
        classes = ['former-tel']
        if tel.select('b'):
            classes.append('has-b')
        if tel.select('em'):
            classes.append('has-em')
        if tel.select('strong'):
            classes.append('has-strong')
        if tel.select('i'):
            classes.append('has-i')
        if tel.select('u'):
            classes.append('has-u')

        tel.attrs['data-tel-number'] = number
        tel.attrs['class'] = classes
        tel.clear()

    return soup.prettify()


def parse_html_for_content(html):
    """
    This function takes in the HTML from transifex and looks for the special tags that
    break down the anchors into two separate divs see function above
    :param html: HTML from Transifex generated from the function above
    :return: clean HTML ready to be post processed
    """
    p = re.compile(r'<.*?>')
    if p.findall(html):
        # h = HTMLParser()

        parser = etree.HTMLParser()
        tree = etree.parse(StringIO(html), parser)

        a = CSSSelector('div.former-anchor')
        translatable_a = CSSSelector('div.former-anchor-translatable')
        img = CSSSelector('div.former-image')
        phones = CSSSelector('div.former-tel')
        italic = CSSSelector('div.former-em')
        bolded = CSSSelector('div.former-strong')

        anchors = a(tree)
        for anchor in anchors:
            try:
                attributes = [(k.replace('data-a-', ''), unescape(v)) for k, v in dict(anchor.attrib).items() if
                              'data-a-' in k]

                ht_st = "<a>{}</a>".format(stringify_children(anchor))
                div = etree.parse(StringIO(fix_html_fragment(ht_st.encode('ascii', 'xmlcharrefreplace')))).getroot()

                for k, v in attributes:
                    div.attrib[k] = v

                swap_element_inbound(div, anchor)
            except:
                pass

        anchors = translatable_a(tree.getroot())
        for anchor in anchors:
            attributes = [(k.replace('data-a-', ''), unescape(v)) for k, v in dict(anchor.attrib).items() if
                          'data-a-' in k]

            content = etree.Element('div')
            link = etree.Element('div')

            for c in anchor:
                if 'class' in c.attrib:
                    if c.attrib['class'] == 'text':
                        content = c
                    if c.attrib['class'] == 'href':
                        link = c

            ht_st = "<a>{}</a>".format(stringify_children(content))
            div = etree.parse(StringIO(fix_html_fragment(ht_st))).getroot()

            for k, v in attributes:
                div.attrib[k] = v

            href = stringify_children(link)

            if href:
                div.attrib['href'] = unescape(href)
            swap_element_inbound(div, anchor)

        images = img(tree.getroot())
        for image in images:
            attributes = [(k.replace('data-img-', ''), unescape(v)) for k, v in dict(image.attrib).items() if
                          'data-img-' in k]
            div = etree.Element('img')

            for k, v in attributes:
                div.attrib[k] = unescape(v)

            swap_element_inbound(div, image)

        """
        _is = italic(tree.getroot())
        for i in _is:
            attributes = [(k.replace('data-em-', ''), unescape(v)) for k, v in dict(i.attrib).items() if
                          'data-em-' in k]

            ht_st = "<em>{}</em>".format(stringify_children(i))
            div = etree.parse(StringIO(fix_html_fragment(ht_st.encode('ascii', 'xmlcharrefreplace')))).getroot()

            for k, v in attributes:
                div.attrib[k] = unescape(v)

            swap_element_inbound(div, i)

        bs = bolded(tree.getroot())
        for b in bs:
            attributes = [(k.replace('data-strong-', ''), unescape(v)) for k, v in dict(b.attrib).items() if
                          'data-strong-' in k]

            ht_st = "<strong>{}</strong>".format(stringify_children(b))
            div = etree.parse(StringIO(fix_html_fragment(ht_st.encode('ascii', 'xmlcharrefreplace')))).getroot()

            for k, v in attributes:
                div.attrib[k] = unescape(v)

            swap_element_inbound(div, b)
        """

        tels = phones(tree.getroot())
        for tel in tels:
            if 'class' in tel.attrib:
                classes = tel.attrib['class'].split(' ')
                tag_format = "{}"
                if 'has-b' in classes:
                    tag_format = "<b>{}</b>".format(tag_format)
                if 'has-u' in classes:
                    tag_format = "<u>{}</u>".format(tag_format)
                if 'has-strong' in classes:
                    tag_format = "<strong>{}</strong>".format(tag_format)
                if 'has-em' in classes:
                    tag_format = "<em>{}</em>".format(tag_format)
                if 'has-i' in classes:
                    tag_format = "<i>{}</i>".format(tag_format)

                tag_format = "<span class=\"tel\">{}</span>".format(tag_format)
                div = etree.parse(StringIO(tag_format.format(tel.attrib['data-tel-number']))).getroot()

                swap_element_inbound(div, tel)
        html = etree.tostring(tree).decode('utf-8')

    soup = BeautifulSoup(html, "lxml")
    return unicode(soup.prettify())


def fix_html_fragment(html):
    soup = BeautifulSoup(html, "lxml")
    return ''.join([unicode(f) for f in soup.body.children]) if soup.body else ''


def _order_attributes(text):
    parser = etree.HTMLParser()
    tree = etree.parse(StringIO(text), parser)

    body = tree.getroot()
    return_list = []

    for e in body.iterdescendants():
        if e == body:
            continue
        _copy = OrderedDict(e.attrib)
        for k in e.attrib.keys():
            del e.attrib[k]
        for k in sorted(_copy.keys()):
            e.attrib[k] = _copy[k]

    for e in list(body.iterchildren())[0]:
        element_text = etree.tostring(e, pretty_print=True, method="html")
        return_list.append(element_text.decode('utf-8'))

    return "\n".join(return_list)


def strip_html(data):
    p = re.compile(r'<.*?>')
    return p.sub('', data)


def stringify_children(node):
    b = BeautifulSoup(etree.tostring(node), "lxml")
    tag = node.tag
    bnode = b.find(tag)
    return "".join([unicode(c) for c in bnode.contents])


def get_transifex_info(slug):
    content_page = Page.objects.get(slug=slug, status='staging')
    slug = content_page.slug
    password = settings.TRANSIFEX_PASSWORD
    user = settings.TRANSIFEX_USER
    project = settings.TRANSIFEX_PROJECT_SLUG

    for k, v in settings.TRANSIFEX_PROJECTS.items():
        if slug in v:
            project = k

    transifex_url_data = {
        "project": project,
        "slug": slug,
    }
    fetch_format = "http://www.transifex.com/api/2/project/{project}/resource/{slug}html/stats/"

    logger.info("Trying to request: %s" % fetch_format.format(**transifex_url_data))
    logger.info("With creds: %s %s" % (user, password))

    return requests.get(fetch_format.format(**transifex_url_data), auth=(user, password))


def pull_completed_from_transifex(slug):
    try:
        content_page = Page.objects.get(slug=slug, status='staging')
        slug = content_page.slug
        project = settings.TRANSIFEX_PROJECT_SLUG
        r = get_transifex_info(slug)
        print("Received from transifex:", r.text)
        trans = r.json()
        response = []
        for language in trans.keys():
            if language in dict(settings.LANGUAGES_CMS):
                if language == 'en':
                    continue
                if trans[language]['completed'] == "100%":
                    response.append(language)
                    pull_from_transifex(content_page.slug, language, project)
        return response
    except Exception as e:
        logger.exception('Error pulling completed from transifex')


def pull_from_transifex(slug, language, project=settings.TRANSIFEX_PROJECT_SLUG):
    content_pages = Page.objects.filter(slug=slug, status='staging')

    try:
        content_page = content_pages[0]
    except Exception as e:
        logger.info('Page not found.')
        raise e

    password = settings.TRANSIFEX_PASSWORD
    user = settings.TRANSIFEX_USER

    transifex_url_data = {
        "project": project,
        "slug": content_page.slug,
        "language": language
    }
    fetch_format = "http://www.transifex.com/api/2/project/{project}/resource/{slug}html/translation/{language}/" \
                   "?mode=default"

    logger.info("Trying to request: %s" % fetch_format.format(**transifex_url_data))
    logger.info("With creds: %s %s" % (user, password))

    r = requests.get(fetch_format.format(**transifex_url_data), auth=(user, password))

    translation = r.json()

    text = translation['content'].strip()
    text = parse_html_for_content(text)
    soup = BeautifulSoup(text, "lxml")

    parser = etree.HTMLParser()
    tree = etree.parse(StringIO(unicode(soup.prettify())), parser)
    selector = CSSSelector('div[data-id]')
    title_selector = CSSSelector('div.title')

    """
    Directions are handled application-wise
    """
    dir_selector = CSSSelector('[dir]')

    for element in dir_selector(tree.getroot()):
        del element.attrib['dir']

    content = selector(tree.getroot())
    title = title_selector(tree.getroot())
    title = title[0].text.strip()

    dict_list = []

    for div in content:
        plugin_dict = {
            'id': div.attrib['data-id'],
            'class': div.attrib['data-class'],
            'type': div.attrib['data-type'],
            'parent': div.attrib['data-parent'],
            'translated': (div.text or '') + u''.join([
                etree.tostring(div, pretty_print=True, method="html").decode('utf-8')
            ]),
        }
        dict_list.append(plugin_dict)

    _translate_page(dict_list, language, content_page, title)


def _translate_page(translation_dict, language, content_page, title):
    translated_content_page, _ = content_page.translations.get_or_create(language_code=language)
    translated_content_page.title = title
    translated_content_page.save()

    for c in content_page.content_items.all():
        if hasattr(c.content_object, 'translations'):
            r, _ = c.content_object.translations.get_or_create(language_code=language)

    for content_dict in translation_dict:
        pci_objects = PageContentItem.objects.filter(page=content_page, object_id=content_dict['id'])
        for pci in pci_objects:
            text = ''
            content_type = pci.content_object
            content_type_translation, _ = pci.content_object.translations.get_or_create(language_code=language)
            if type(content_type) == TextContent and content_dict['class'] == 'TextContent':
                text = content_dict['translated']
            if type(content_type) == SubSectionContent and content_dict['class'] == 'SubSectionContent':
                soup = BeautifulSoup(content_dict['translated'], "lxml")
                content_title = soup.find('div', {'class': 'content-title'})
                content_type_translation.title = content_title.text
                content_title.decompose()
                text = "".join([str(c) for c in soup.div.children])

            if type(content_type) == QAContent and content_dict['class'] == 'QAContent':
                soup = BeautifulSoup(content_dict['translated'], "lxml")
                answer = soup.findAll('div', {'class': 'answer'})
                question = soup.findAll('div', {'class': 'question'})
                content_type_translation.question = question[0].text if question else ''
                content_type_translation.answer = answer[0].encode_contents().decode("utf-8") if answer else ''
                text = render_to_string(
                    'content/qanda_content.html',
                    context={
                        'id': content_type_translation.id,
                        'collapse': ("checked" if not content_type.is_collapsed else ""),
                        'question': content_type_translation.question,
                        'answer': content_type_translation.answer
                    }
                )
            if hasattr(content_type_translation, 'text') and text:
                if content_type_translation.text != text:
                    content_type_translation.text = text
                    content_type_translation.save()
                    content_page.updated_at = timezone.now()
                    content_page.save()

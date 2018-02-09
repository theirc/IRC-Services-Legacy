import itertools
import json

import hashlib
import requests
from django.utils.text import slugify

url = 'http://refugee-info-api-v2.prod.rescueapp.org/v2'
# url = 'http://localhost:8000/v2'

headers = {
    'content-type': 'application/json',
    'ServiceInfoAuthorization': 'token 3a4a15e8eef71821b75834d179be732368026c78'
}

countries = requests.get('{}/region/?level=1&simple'.format(url), headers=headers).json()
countries = dict({(c['slug'], c['id']) for c in countries})


def update_db(section):
    slug = section['slug']
    re = requests.get("{}/page/{}/?status=staging".format(url, slug), headers=headers).json()
    re['pop_up'] = section['hide_from_toc']

    ru = requests.put("{}/page/{}/?status=staging".format(url, re['slug']),
                      data=json.dumps(re), headers=headers).text

    return ru


def add_to_db(section):
    title = section['title']
    index = section['index']
    important = section['__important'] if '__important' in section else False
    pop_up = section['hide_from_toc']
    slug = section['slug']
    icon = section['vector_icon']
    content = section['section']
    limit_to = countries[section['country_slug']]

    create = {"translations": {"en": {"title": title}}, "slug": slug, "pop_up": pop_up, "important": important,
              "icon": icon, "limited_to": limit_to}

    try:
        re = requests.post("{}/page/".format(url), data=json.dumps(create), headers=headers).json()
        # print(re)

    except:
        re = requests.get("{}/page/{}/?status=staging".format(url, slug), data=json.dumps(create),
                          headers=headers).json()
        # @rint(re)
        pass

    sub_contents = []
    if 'sub' in section:
        for i, s in enumerate(section['sub']):
            sub_contents.append({
                "index": i + 1,
                "content_object": {
                    "id": -1,
                    "text": s['section'],
                    "slug": s['slug'] if 'slug' in s else slugify(s['title']),
                    "title": s['title'],
                },
                "content_type": "subsectioncontent",
                "page": re['id']
            })

    re.update({
        "content_items": [
                             {
                                 "index": 0,
                                 "content_object": {
                                     "id": -1,
                                     "text": content
                                 },
                                 "content_type": "textcontent",
                                 "page": re['id']
                             }
                         ] + sub_contents,})

    ru = requests.put("{}/page/{}/?status=staging".format(url, re['slug']),
                      data=json.dumps(re), headers=headers).json()
    return ru


regions = requests.get('http://api.refugee.info/v1/region').json()
print("Importing", len(regions))

regions = [r for r in regions if r['full_slug'].split('--')[0] == 'serbia']
regions = [r for r in regions if not r['hidden']]

for r in regions:
    for c in r['content']:
        c['page_slug'] = r['slug']
        c['country_slug'] = r['full_slug'].split('--')[0]
        c['hash'] = hashlib.sha224(c['section'].encode('utf-8')).hexdigest()

    important = []
    for c in r['important_information']:
        if 'content' in c and c['content']:
            main = c['content'][0]
            main['sub'] = c['content'][1:]
            main['slug'] = c['slug'] if 'slug' in c else slugify(c['title'])
            main['__important'] = True

            main['index'] = 10000
            main['page_slug'] = r['slug']
            main['country_slug'] = r['full_slug'].split('--')[0]
            main['hash'] = hashlib.sha224(main['section'].encode('utf-8')).hexdigest()

            important.append(main)
    r['content'] += important
reduced = list(itertools.chain.from_iterable([r['content'] for r in regions]))

by_hash = {}

all_current = requests.get("{}/page/?status=staging".format(url), headers=headers).json()
all_current = dict({(c['slug'], json.dumps(c)) for c in all_current})

assignments = {}

for section in reduced:
    # @print (section)
    # print ('\n\n')
    if 'slug' not in section or not section['slug']:
        slug = section['anchor_name'] or slugify(section['title'])
        # slug = slugify(section['title'])
        section['slug'] = slug
    else:
        slug = section['slug']

    if section['country_slug'] not in assignments:
        assignments[section['country_slug']] = dict()

    if section['page_slug'] not in assignments[section['country_slug']]:
        assignments[section['country_slug']][section['page_slug']] = []

    if section['hash'] in by_hash:
        by_d = dict(assignments[section['country_slug']][section['page_slug']])
        if not section['hash'] in by_d:
            print("Assign {} to {}".format(slug, section['page_slug']))
            assignments[section['country_slug']][section['page_slug']].append((section['hash'], section['index']))
    else:
        if slug in all_current:
            current = json.loads(all_current[slug])
            try:
                current_html = "\n".join([c['content_object']['text'] for c in current['content_items']])
                current_hash = hashlib.sha224(current_html.encode('utf-8')).hexdigest()
                by_hash[current_hash] = current

                if current_hash != section['hash']:
                    old_slug_len = len(
                        [k for k in [z['slug'] for z in by_hash.values()] if str(k).startswith(slug)])
                    if old_slug_len:
                        new_slug = "{}-{}".format(slug, old_slug_len)
                    else:
                        new_slug = slug

                    if new_slug not in all_current:
                        section['slug'] = new_slug
                        by_hash[section['hash']] = section
                        print("Add {} to db and assign to to {}".format(new_slug, section['page_slug']))
                        db = add_to_db(section)
                        all_current[new_slug] = json.dumps(db)

                        assignments[section['country_slug']][section['page_slug']].append(
                            (section['hash'], section['index']))
                    else:
                        try:
                            current = json.loads(all_current[new_slug])
                            current_html = "\n".join(
                                [c['content_object']['text'] for c in current['content_items']])
                            current_hash = hashlib.sha224(current_html.encode('utf-8')).hexdigest()
                            by_hash[current_hash] = current
                            section['slug'] = new_slug
                            print("Assign {} to {}".format(new_slug, section['page_slug']))

                            assignments[section['country_slug']][section['page_slug']].append(
                                (current_hash, section['index']))
                        except Exception as e:
                            print(e)

                else:
                    section['slug'] = slug
                    print("Assign {} to {}".format(slug, section['page_slug']))

                    assignments[section['country_slug']][section['page_slug']].append(
                        (current_hash, section['index']))
            except Exception as e1:
                print(e1)

        else:
            print("Add new {} to db and assign to to {}".format(slug, section['page_slug']))
            by_hash[section['hash']] = section
            db = add_to_db(section)
            all_current[slug] = json.dumps(db)
            assignments[section['country_slug']][section['page_slug']].append((section['hash'], section['index']))

for section in [c for c in reduced if c['hide_from_toc']]:
    if section['hash'] in by_hash:
        db = by_hash[section['hash']]
        if 'pop_up' not in db or db['pop_up'] != section['hide_from_toc']:
            update_db(section)

for country_slug, p in assignments.items():
    print(country_slug)
    # country_slug= 'greece'
    # p = assignments['greece']

    for page_slug, items in p.items():
        r = requests.get("{}/page_by_region/{}/?status=staging".format(url, page_slug), headers=headers).json()

        sor = [dict(**by_hash[a[0]]) for a in sorted(items, key=lambda o: o[1])]

        for i, s in enumerate(sor):
            p = json.loads(all_current[s['slug']])

            if 'content_items' in s:
                del s['content_items']

            s['id'] = p['id']
            s['index'] = i
            if 'id' in s:
                s['page'] = s['id']
            else:
                print(s)

            r['pages'] = sor

        r2 = requests.put("{}/page_by_region/{}/?status=staging".format(url, country_slug), data=json.dumps(r),
                          headers=headers)

        print(r2.status_code)
"""
# ONCE DONE WITH IMPORT RUN THIS CODE WHERE YOU HAVE ACCESS TO THE DB
from cms import models
from cms import utils
for p in models.Page.objects.all():
    try:
        p.publish()
        #utils.push_to_transifex(p.slug)
    except:
        pass
    r = p.regions_with_order.all()
    c = set([list(a.region.parents)[-1].slug for a in r if len(list(a.region.parents)) > 0])
    if len(c) > 1:
        if p.limited_to:
            p.limited_to = None
            print('Limited to none', p.id)
            p.save()
"""

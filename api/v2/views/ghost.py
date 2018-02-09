"""
https://refugee-info.ghost.io/ghost/api/v0.1/posts?filter=tag:English
"""

import json

import requests
import requests.cookies
from admin_panel import utils  # importing here to avoid any circular references
from django.conf import settings
from rest_framework import permissions, views
from rest_framework import response

POSTS_URL = 'https://refugee-info.ghost.io/ghost/api/v0.1/posts'
TAGS_URL = 'https://refugee-info.ghost.io/ghost/api/v0.1/tags'
AUTH_REQUEST = {
    "grant_type": 'password',
    "username": settings.GHOST_USER_NAME,
    "password": settings.GHOST_PASSWORD,
    "client_id": "ghost-admin",
    "client_secret": "e88bddc91792",
}


class BlogListAPIView(views.APIView):
    permission_classes = (permissions.AllowAny,)

    def get(self, request, *args, **kwargs):
        jar = requests.cookies.RequestsCookieJar()

        authorization_key = requests.post("https://refugee-info.ghost.io/ghost/api/v0.1/authentication/token",
                                          data=AUTH_REQUEST,
                                          cookies=jar).json()

        query_string = dict([(k, v[0]) for k, v in dict(**request.query_params).items()])

        if 'page_size' in query_string:
            query_string['limit'] = query_string['page_size']

        if 'ordering' in query_string:
            ordering = []
            for o in query_string['ordering'].split(','):
                if '-' in o:
                    ordering.append("".join(o.split('-')) + ' desc')
                else:
                    ordering.append(o)

            query_string['order'] = ",".join(ordering)

        added_qs = "&".join(["{}={}".format(k, v) for k, v in query_string.items()])

        auth_headers = {'Authorization': "Bearer {}".format(authorization_key['access_token'])}
        post_response = requests.get(POSTS_URL + '/?status=all&' + added_qs + '&filter=tag:English',
                                     headers=auth_headers, cookies=jar)

        if post_response.status_code != 200:
            return response.Response({})

        post_response_json = post_response.json()

        posts = post_response_json['posts']
        meta = post_response_json['meta']['pagination']

        for p in posts:
            p['transifex'] = utils.get_blog_transifex_info(p['slug'])

            for k, v in p['transifex'].items():
                v['last_update'] += 'Z'

        return response.Response({
            "count": meta['total'],
            "previous": meta['prev'],
            "next": meta['next'],
            "results": posts
        })


class BlogPushAPIView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        post_id = kwargs.pop('id')
        if not post_id:
            return response.Response({})

        jar = requests.cookies.RequestsCookieJar()

        authorization_key = requests.post("https://refugee-info.ghost.io/ghost/api/v0.1/authentication/token",
                                          data=AUTH_REQUEST,
                                          cookies=jar).json()

        auth_headers = {'Authorization': "Bearer {}".format(authorization_key['access_token'])}
        post_response = requests.get("{}/{}/?status=all".format(POSTS_URL, post_id),
                                     headers=auth_headers, cookies=jar)

        if post_response.status_code == 200:
            post_list = post_response.json()
            return response.Response(utils.push_blog_post_to_transifex(post_list['posts'][0]))

        return response.Response({})


class BlogPullAPIView(views.APIView):
    permission_classes = (permissions.IsAuthenticated,)

    def post(self, request, *args, **kwargs):
        post_id = kwargs.pop('id')
        if not post_id:
            return response.Response({})

        jar = requests.cookies.RequestsCookieJar()

        authorization_key = requests.post("https://refugee-info.ghost.io/ghost/api/v0.1/authentication/token",
                                          data=AUTH_REQUEST,
                                          cookies=jar).json()

        auth_headers = {'Authorization': "Bearer {}".format(authorization_key['access_token'])}
        post_response = requests.get("{}/{}/?status=all".format(POSTS_URL, post_id),
                                     headers=auth_headers, cookies=jar)

        tags = requests.get("{}/?status=all&limit=1000".format(TAGS_URL),
                            headers=auth_headers, cookies=jar).json()['tags']
        print(tags, auth_headers, post_response)
        
        tag_map = {}
        t_en = [o for o in tags if o['slug'] == 'english']
        if t_en:
            tag_map['en'] = t_en

        for k, v in settings.GHOST_TAG_MAP.items():
            t = [o for o in tags if o['slug'] == v]
            if t:
                tag_map[k] = t

        if post_response.status_code == 200:
            post_list = post_response.json()
            post_en = post_list['posts'][0]
            info = utils.get_blog_transifex_info(post_en['slug'])
            for k, v in info.items():
                if k == 'en' or v['completed'] != '100%':
                    continue

                translated = utils.pull_blog_from_transifex(post_en['slug'], k)
                translated['tags'] = [tag_map[k] for k in tag_map]
                if k in tag_map:
                    translated['tags'] = tag_map[k]
                
                b = requests.get("{}/slug/{}/?status=all".format(POSTS_URL, translated['slug']), headers=auth_headers)

                if b.status_code == 404:
                    r = requests.post(POSTS_URL + '/', data=json.dumps({"posts": [translated]}),
                                      headers={
                                          **{
                                              'Content-Type': 'application/json',
                                          },
                                          **auth_headers
                                      }, cookies=jar)
                    print({"posts": [translated]}, '\n\n\n')
                    print(r.status_code, r.text);
                else:
                    possible_posts = b.json()
                    post_to_be_edited = possible_posts['posts'][0]
                    r = requests.put("{}/{}/".format(POSTS_URL, post_to_be_edited['id']),
                                     data=json.dumps({"posts": [translated]}),
                                     headers={
                                         **{
                                             'Content-Type': 'application/json',
                                         },
                                         **auth_headers
                                     }, cookies=jar)
                    print({"posts": [translated]}, '\n\n\n')
                    print(r.status_code, r.text);
            return response.Response(info)
        return response.Response({})

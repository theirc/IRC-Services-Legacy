import json
from http.client import CREATED, OK, NOT_FOUND, BAD_REQUEST
from unittest import skip

from django.core.urlresolvers import reverse
from django.forms import model_to_dict
from django.test import TestCase

from services.models import ServiceArea, Nationality, Service
from services.tests.factories import FeedbackFactory
from services.tests.test_api import APITestMixin


class FeedbackTest(APITestMixin, TestCase):
    def setUp(self):
        super().setUp()
        from .set_up import create_mock_data
        create_mock_data()
        # self.feedback1 = FeedbackFactory()
        # self.feedback2 = FeedbackFactory()
        # self.feedback3 = FeedbackFactory()

    def try_to_create_one_like(self, example, expected_status=CREATED):
        if expected_status == CREATED:
            example.full_clean()  # double-check it's valid
        data = model_to_dict(example)
        del data['id']
        data['area_of_residence'] = \
            ServiceArea.objects.get(pk=data['area_of_residence']).get_api_url()
        data['nationality'] = Nationality.objects.get(pk=data['nationality']).get_api_url()
        data['service'] = Service.objects.get(pk=data['service']).get_api_url()
        # Remove any fields whose value is None
        data = {k: v for k, v in data.items() if v is not None}
        rsp = self.client.post(reverse('feedback-list'), data=data)
        self.assertEqual(expected_status, rsp.status_code, msg=rsp.content.decode('utf-8'))

    @skip
    def test_create_delivered_feedback(self):
        example = FeedbackFactory(delivered=True)
        self.try_to_create_one_like(example)

    @skip
    def test_create_undelivered_feedback(self):
        example = FeedbackFactory(delivered=False)
        self.try_to_create_one_like(example)

    @skip
    def test_cannot_get_feedback(self):
        # Feedback is write-only
        feedback = FeedbackFactory()
        # `reverse` doesn't even work because there's no such URL defined anywhere
        # url = reverse('feedback-detail', args=[self.id])
        url = '/v1/feedbacks/%d/' % feedback.pk
        rsp = self.client.get(url)
        self.assertEqual(NOT_FOUND, rsp.status_code, msg=rsp.content.decode('utf-8'))

    @skip
    def test_staff_sat_required_if_service_provided(self):
        example = FeedbackFactory(
            delivered=True,
            staff_satisfaction=None,
        )
        self.try_to_create_one_like(example, expected_status=BAD_REQUEST)
        example.staff_satisfaction = ''
        self.try_to_create_one_like(example, expected_status=BAD_REQUEST)
        example.staff_satisfaction = 3
        self.try_to_create_one_like(example, expected_status=CREATED)

    @skip
    def test_staff_sat_not_required_if_service_not_provided(self):
        example = FeedbackFactory(
            delivered=False,
            staff_satisfaction=None,
        )
        self.try_to_create_one_like(example)

    @skip
    def test_get_feedbacks(self):
        # Should get all, whether top-level or not
        rsp = self.get_with_token(reverse('feedback-list'))
        self.assertEqual(OK, rsp.status_code)
        result = json.loads(rsp.content.decode('utf-8'))
        results = result
        result_names = [item['name'] for item in results]
        self.assertIn(self.feedback1.name, result_names)
        self.assertIn(self.feedback2.name, result_names)
        self.assertIn(self.feedback3.name, result_names)

    @skip
    def test_get_feedback(self):
        rsp = self.get_with_token(self.feedback1.get_api_url())
        result = json.loads(rsp.content.decode('utf-8'))
        self.assertEqual(self.feedback1.id, result['id'])


class FeedbackFilterTest(APITestMixin, TestCase):
    def setUp(self):
        super().setUp()
        self.url = '/v1/feedback/'
        # self.feedback1 = FeedbackFactory(delivered=True)
        # self.feedback2 = FeedbackFactory(delivered=True, anonymous=True)
        # self.feedback3 = FeedbackFactory(extra_comments='', delivered=False)

    def boolean_filtering_test(self, query_name, positive_ids, negative_ids):
        # "Yes"
        url = self.url + "?%s=2" % query_name
        rsp = self.client.get(url)
        self.assertEqual(OK, rsp.status_code, msg=rsp.content.decode('utf-8'))
        response = json.loads(rsp.content.decode('utf-8'))
        self.assertEqual(len(positive_ids), len(response))
        ids = [item['id'] for item in response]
        for id in positive_ids:
            self.assertIn(id, ids)
        # "No"
        url = self.url + "?%s=3" % query_name
        rsp = self.client.get(url)
        self.assertEqual(OK, rsp.status_code, msg=rsp.content.decode('utf-8'))
        response = json.loads(rsp.content.decode('utf-8'))
        self.assertEqual(len(negative_ids), len(response))
        ids = [item['id'] for item in response]
        for id in negative_ids:
            self.assertIn(id, ids)

    @skip
    def test_service_pk_filtering(self):
        url = self.url + "?service=%d" % self.feedback1.service.id
        rsp = self.client.get(url)
        self.assertEqual(OK, rsp.status_code, msg=rsp.content.decode('utf-8'))
        response = json.loads(rsp.content.decode('utf-8'))
        self.assertEqual(1, len(response))
        self.assertEqual(self.feedback1.id, response[0]['id'])

    @skip
    def test_extra_comments_non_empty_filtering(self):
        self.boolean_filtering_test(
            'extra_comments',
            [self.feedback1.id, self.feedback2.id],
            [self.feedback3.id]
        )

    @skip
    def test_delivered_boolean_filtering(self):
        self.boolean_filtering_test(
            'delivered',
            [self.feedback1.id, self.feedback2.id],
            [self.feedback3.id]
        )

    @skip
    def test_anonymous_boolean_filtering(self):
        self.boolean_filtering_test(
            'anonymous',
            [self.feedback2.id],
            [self.feedback1.id, self.feedback3.id],
        )


class NationalityTest(TestCase):
    def test_nationalities(self):
        # Get list of nationalities
        url = reverse('nationality-list')
        rsp = self.client.get(url)
        self.assertEqual(OK, rsp.status_code, msg=rsp.content.decode('utf-8'))

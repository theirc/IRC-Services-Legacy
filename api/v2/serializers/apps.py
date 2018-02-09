from api.utils import generate_translated_fields
from rest_framework import serializers
from services.models import NewsletterEmailTemplate


class NewsletterEmailTemplateSerializer(serializers.ModelSerializer):
    class Meta:
        model = NewsletterEmailTemplate
        fields = '__all__'

from rest_framework import serializers
from .models import UserSubscription

class UserSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSubscription
        fields = ('phone', 'categoryId', 'active')

    def create(self, validated_data):
        return UserSubscription.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('phone', instance.phone)
        instance.slug = validated_data.get('active', instance.active)
        instance.save()
        return instance



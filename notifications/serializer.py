from rest_framework import serializers
from .models import UserSubscription, EventLog, MessageLog

class UserSubscriptionSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserSubscription
        fields = ('phone', 'categoryId', 'active', 'code')

    def create(self, validated_data):
        return UserSubscription.objects.create(**validated_data)
    
    def update(self, instance, validated_data):
        instance.name = validated_data.get('phone', instance.phone)
        instance.slug = validated_data.get('active', instance.active)
        instance.save()
        return instance

class EventLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = EventLog
        fields = ('created', 'phone', 'event', 'message', 'country')

    def create(self, validated_data):
        return EventLog.objects.create(**validated_data)

class MessageLogSerializer(serializers.ModelSerializer):
    class Meta:
        model = MessageLog
        fields = ('account_sid', 'body', 'date_created', 'date_sent', 'direction', 'error_code','error_message', 'from_number',
        'price', 'price_unit', 'sid', 'status', 'to')

    def create(self, validated_data):
        return EventLog.objects.create(**validated_data)

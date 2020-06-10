from django.db import models
from django.utils.translation import ugettext_lazy as _, activate, get_language
from django.core.validators import MinValueValidator, MaxValueValidator

class UserSubscription(models.Model):
    phone = models.CharField(
        _("phone"),
        max_length=255,
        blank=False,
    )
    categoryId = models.CharField(
        _("category"),
        max_length=255,
        blank=False, 
        null=False,
    )
    active = models.BooleanField(
        _('active'), 
        default=False,
    )
    code = models.CharField(
        max_length=20,
        blank=True,
    )
    class Meta:
        unique_together = ('phone', 'categoryId','active')

# class Notification(models.Model):
    
class EventLog(models.Model):
    created = models.DateTimeField(auto_now_add=True)
    phone = models.CharField(
        _("phone"),
        max_length=255,
        blank=False,
    )
    event = models.CharField(
        max_length=255,
        blank=True,
    )
    message = models.CharField(
        max_length=255,
        blank=True,
    )
    country = models.CharField(
        max_length=255,
        blank=True,
    )

class MessageLog(models.Model):
    account_sid = models.CharField(max_length=255,blank=True)
    body = models.CharField(max_length=255,blank=True)
    date_created = models.DateTimeField(blank=True, null=True)
    date_sent = models.DateTimeField(blank=True, null=True)
    direction = models.CharField(max_length=15,blank=True)
    error_code = models.CharField(max_length=20,blank=True, null=True)
    error_message = models.CharField(max_length=255,blank=True, null=True)
    from_number = models.CharField(max_length=255,blank=True)
    price = models.CharField(max_length=255,blank=True, null=True)
    price_unit = models.CharField(max_length=255,blank=True)
    sid = models.CharField(max_length=255,blank=True)
    status = models.CharField(max_length=255,blank=True)
    to = models.CharField(max_length=255,blank=True)



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
    class Meta:
        unique_together = ('phone', 'categoryId',)

# class Notification(models.Model):
    

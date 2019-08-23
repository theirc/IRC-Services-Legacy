from django.db import models

# Create your models here.
class UserSubscription(models.Model):
    phone = models.CharField(
        _("phone"),
        max_length=255,
        blank=True,
        default=''
    )
    categoryId = models.IntegerField(
        _("categoryId"),
        blank=True, null=True,
        validators=[
            MinValueValidator(0)
        ]
    )
    name = models.CharField(
        _("name"),
        max_length=255,
        blank=True,
        default=''
    )
    validationCode = models.CharField(
        _("name"),
        max_length=255,
        blank=True,
        default=''
    )

class Notification(models.Model):
    

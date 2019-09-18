from django.db import models

# Create your models here.
class UserSubscription(models.Model):
    phone = models.CharField(
        max_length=255,
        blank=True,
        default=''
    )
    category = models.CharField(
        max_length=255
    )
    validationCode = models.CharField(
        max_length=255,
        blank=True,
        default=''
    )
    expires = models.DateTimeField(
        blank=True, 
        null=True
    )

#class Notification(models.Model):
    

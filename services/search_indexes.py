
from django.utils import timezone
from haystack import indexes
from . import models
from . import meta


class ServiceIndex(indexes.SearchIndex, indexes.Indexable):
    text = indexes.CharField(document=True, use_template=True)

    def get_model(self):
        return models.Service

    def index_queryset(self, using=None):
        return self.get_model().objects.filter(
            created_at__lte=timezone.now()
        )


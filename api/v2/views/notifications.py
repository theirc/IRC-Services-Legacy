from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from notifications.models import UserSubscription
#from organizations.serializers import OrganizationSerializer

class JSONResponse(HttpResponse):

    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

def add_subscription(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        
        serializer = UserSubscription(data=data)
        if serializer.is_valid():
            serializer.save()
            return JSONResponse(serializer.data, status=201)

def remove_subscription(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        if hasattr(data, "category") & hassattr(data, "phone"):
            subscription = UserSubscription.objects.get(phone=data.pop("phone"), categoryId = data.pop("category"))
            subscription.delete()

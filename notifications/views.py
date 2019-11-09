from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from notifications.models import UserSubscription
from django.views.decorators.csrf import csrf_exempt
from celery.utils.log import get_task_logger
from twilio.rest import Client

from notifications.serializer import UserSubscriptionSerializer
logger = get_task_logger(__name__)

class JSONResponse(HttpResponse):

    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

@csrf_exempt
def add_subscription(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        
        serializer = UserSubscriptionSerializer(data=data)
        if serializer.is_valid():
            try:
                serializer.save()
                # account_sid = os.environ.get('TWILIO_SID', '')
                account_sid = ''
                auth_token = ''
                client = Client(account_sid, auth_token)
                try:

                    message = client.messages \
                        .create(
                            from_='whatsapp:+15184130994',
                            body='Hola! Hemos recibido tu solicitud para subscribirte la categoría CARAVANAS. Envía la palabra "si" para confirmar tu subscripción.',
                            # status_callback='http://postb.in/1234abcd',
                            to='whatsapp:+5493413523631'
                        )
                    print(message.sid)
                except Exception as e:
                    logger.error("Error sending message:"+e.msg)
                return JSONResponse(serializer.data, status=201)
            except Exception as e:
                logger.exception("Error saving subscrition")
                return JSONResponse("{error: 'Duplicated'}", status=400)
            
            
        else:
            return JSONResponse("{error: 'Invalid data'}", status=400)

@csrf_exempt
def activate_subscription(request):
    if request.method == 'POST':
        data = JSONParser().parse(request)
        subscription = UserSubscription.objects.get(phone=data.pop("phone"), categoryId = data.pop("categoryId"))
        if (subscription):
            subscription.active = True
            subscription.save()
            return JSONResponse("{msg: 'Activated'}", status=201)
        else:
            return JSONResponse("{error: 'Invalid data'}", status=400)

@csrf_exempt
def remove_subscription(request):            
    if request.method == 'POST':
        data = JSONParser().parse(request)
        subscription = UserSubscription.objects.get(phone=data.pop("phone"), categoryId = data.pop("categoryId"))
        if (subscription):
            subscription.active = True
            subscription.delete()
            return JSONResponse("{msg: 'Deleted'}", status=201)
        else:
            return JSONResponse("{error: 'Invalid data'}", status=400)


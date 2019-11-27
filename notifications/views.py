from django.http import HttpResponse
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from notifications.models import UserSubscription, EventLog, MessageLog
from django.views.decorators.csrf import csrf_exempt
from celery.utils.log import get_task_logger
from twilio.rest import Client
from django.conf import settings
from django.core import serializers
from django.views.decorators.http import require_http_methods, require_POST

from notifications.serializer import UserSubscriptionSerializer, EventLogSerializer, MessageLogSerializer
logger = get_task_logger(__name__)

class JSONResponse(HttpResponse):

    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

@csrf_exempt
@require_POST
def add_subscription(request):
    data = JSONParser().parse(request)
    serializer = UserSubscriptionSerializer(data=data)
    if serializer.is_valid():
        try:
            serializer.save()
            account_sid = settings.TWILIO_SID
            auth_token = settings.TWILIO_TOKEN
            
            try:
                client = Client(account_sid, auth_token)
                logger.info("*** client instance created ")
                message = client.messages.create(
                        from_='whatsapp:+15184130994',
                        body='Hola! Hemos recibido tu solicitud para subscribirte la categor\xeda CARAVANAS. Env\xeda la palabra "si" para confirmar tu subscripci\xf3n.',
                        # status_callback='http://postb.in/1234abcd',
                        to='whatsapp:+5493413523631'
                )
                print(message.sid)
                logger.info("*** Message sent ")
                return JSONResponse("message sent")
            except Exception as e:
                logger.error("Error sending whatsapp message:"+e.msg)
            return JSONResponse(serializer.data, status=201)
        except Exception as e:
            logger.exception("Error saving subscrition")
            return JSONResponse("{error: 'Duplicated'}", status=400)
        return JSONResponse("Message sent")    
        
    else:
        return JSONResponse("{error: 'Invalid data'}", status=400)
    
    return JSONResponse("bad request")

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

@csrf_exempt
def add_log(request):            
    if request.method == 'POST':
        data = JSONParser().parse(request)      
        serializer = EventLogSerializer(data=data)
        if serializer.is_valid():
            try:
                serializer.save()
                return JSONResponse("{result: 'Saved'}", status=201)

            except Exception as e:
                logger.exception("Error saving log")
                return JSONResponse("{error: 'Error'}", status=400)    
        else:
            return JSONResponse("{error: 'Invalid data'}", status=400)

@csrf_exempt
def get_logs(request):
    if request.method == 'GET':
        serialized_qs = serializers.serialize('json', EventLog.objects.all())
        #serializer = EventLogSerializer(logs, many=True)
        
        return JSONResponse(serialized_qs, status=200)
        #return JSONResponse(serializer, status=200)

@csrf_exempt
def fetch_message_logs(request):
    account_sid = settings.TWILIO_SID
    auth_token = settings.TWILIO_TOKEN    
    try:
        qs = MessageLog.objects.order_by('date_sent').last()
    except Exception as e:
        return JSONResponse('Error reading messages from DB')
    
    print(qs)
    try:
        client = Client(account_sid, auth_token)
    except Exception as e:
        return JSONResponse('Error creating Twilio client instance')
        
    if qs:  
        try:
            messages = client.messages.list(date_sent_after = qs.date_sent)
        except Exception as e:
            return JSONResponse('Error fetching messages from Twilio')
        for msg in messages:
            instance = MessageLog(
                sid = msg.sid,
                body = msg.body,
                from_number = msg.from_,
                to = msg.to,
                status = msg.status,
                price_unit = msg.price_unit,
                direction = msg.direction,
                date_sent = msg.date_sent,
                date_created = msg.date_created,
                error_code = msg.error_code,
                error_message = msg.error_message
            )
            instance.save()
    else:
        try:
            messages = client.messages.list()
        except Exception as e:
            return JSONResponse('Error fetching messages from Twilio')
        for msg in messages:
            instance = MessageLog(
                sid = msg.sid,
                body = msg.body,
                from_number = msg.from_,
                to = msg.to,
                status = msg.status,
                price_unit = msg.price_unit,
                direction = msg.direction,
                date_sent = msg.date_sent,
                date_created = msg.date_created,
                error_code = msg.error_code,
                error_message = msg.error_message
            )
            instance.save()
    return JSONResponse('Done')



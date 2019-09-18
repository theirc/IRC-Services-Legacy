from django.shortcuts import render
from django.views.decorators.csrf import csrf_exempt
from rest_framework.renderers import JSONRenderer
from rest_framework.parsers import JSONParser
from django.shortcuts import render
from django.http import HttpResponse
from celery.utils.log import get_task_logger
from notifications import models
logger = get_task_logger(__name__)

# Create your views here.
class JSONResponse(HttpResponse):
    def __init__(self, data, **kwargs):
        content = JSONRenderer().render(data)
        kwargs['content_type'] = 'application/json'
        super(JSONResponse, self).__init__(content, **kwargs)

@csrf_exempt
def verify_phone(request):
    """
    Verify phone by sending a 4 digit code
    """
    return JSONResponse("Verify Phone", status=200)

@csrf_exempt
def verify_code(request):
    """
    Verify code
    """
    return JSONResponse("Veryfy Code", status=200)

@csrf_exempt
def content_publish(request):
    """
    When an entry is published, send notifications
    """
    data = JSONParser().parse(request)
    logger.info(data)
    return JSONResponse(data, status=200)

@csrf_exempt
def sms_received(request):
    data = JSONParser().parse(request.POST)
    return Null
    

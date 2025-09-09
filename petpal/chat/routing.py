from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    # ws://<host>/ws/chat/<room_name>/
    re_path(r"ws/chat/(?P<room_name>[^/]+)/$", ChatConsumer.as_asgi()),
]
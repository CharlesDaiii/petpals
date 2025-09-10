from django.urls import re_path
from .consumers import ChatConsumer

websocket_urlpatterns = [
    # ws://<host>/ws/chat/<conv_id>/
    re_path(r"ws/chat/(?P<conv_id>[^/]+)/$", ChatConsumer.as_asgi()),
]
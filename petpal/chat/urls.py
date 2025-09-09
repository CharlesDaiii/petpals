from django.urls import path
from . import views



urlpatterns = [
    path("messages/<str:room_name>/", views.MessageListView.as_view(), name="chat_message_list"),
    path("messages/<str:room_name>/send/", views.SendMessageView.as_view(), name="chat_send_message"),
]
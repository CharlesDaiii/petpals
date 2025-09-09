from django.urls import path
from . import views



urlpatterns = [
    path("dm/", views.CreateDMView.as_view()),
    path("group/", views.CreateGroupView.as_view()),
    path("conversations/", views.UserConversationsView.as_view()),
    path("conversations/<uuid:id>/read/", views.MarkReadView.as_view()),
    path("conversations/<uuid:id>/messages/", views.ConversationMessageView.as_view()),
    path("conversations/<uuid:id>/messages/send/", views.SendMessageView.as_view()),
]
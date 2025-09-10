import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message, ConversationParticipant
from django.contrib.auth.models import AnonymousUser

@database_sync_to_async
def save_msg(conv_id, user, text):
    return Message.objects.create(conversation_id=conv_id, sender=user if user.is_authenticated else None, text=text)

@database_sync_to_async
def is_member(conv_id, user_id):
    return ConversationParticipant.objects.filter(conversation_id=conv_id, user_id=user_id).exists()

class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.conv_id = self.scope["url_route"]["kwargs"]["conv_id"]
        self.group_name = f"chat_{self.conv_id}"

        user = self.scope.get("user", AnonymousUser())
        if not user.is_authenticated or not await is_member(self.conv_id, user.id):
            await self.close(code=4003)  # 不允许加入
            return

        await self.channel_layer.group_add(
            self.group_name, 
            self.channel_name
        )
        await self.accept()

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data).get("msg")
        text = (data.get("text") or "").strip()
        print("received message:", data)
        if not text:
            return
        await save_msg(self.conv_id, self.scope["user"], text)
        await self.channel_layer.group_send(
            self.group_name,
            {
                "id": data.get("id"),
                "type": "chat.message",
                "text": text,
                "sender_name": data.get("sender_name"),
                "conversation_id": data.get("conversation_id"),
                "kind": data.get("kind"),
                "created_at": data.get("created_at")
            },
        )

    async def chat_message(self, event):
        print("sending message:", event)
        await self.send(text_data=json.dumps({
            "id": event["id"],
            "text": event["text"],
            "sender_name": event["sender_name"],
            "conversation_id": event["conversation_id"],
            "kind": event["kind"],
            "created_at": event["created_at"],
        }))

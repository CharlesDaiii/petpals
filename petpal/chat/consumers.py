import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from .models import Message

@database_sync_to_async
def save_msg(room, user, text):
    return Message.objects.create(room=room, sender=user if user.is_authenticated else None, text=text)


class ChatConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        self.room_name = self.scope["url_route"]["kwargs"]["room_name"]
        self.group_name = f"chat_{self.room_name}"

        if not self.scope["user"].is_authenticated: 
            await self.close()
            return
        await self.channel_layer.group_add(self.group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, close_code):
        await self.channel_layer.group_discard(self.group_name, self.channel_name)

    async def receive(self, text_data):
        data = json.loads(text_data)
        # 约定前端发 {type: "message", text: "...", sender: "..."}
        msg = {
            "type": "chat.message",
            "text": data.get("text", ""),
            "sender": data.get("sender", "anonymous"),
        }
        await self.channel_layer.group_send(self.group_name, msg)
        await save_msg(self.room_name, self.scope["user"], data.get("text",""))

    async def chat_message(self, event):
        await self.send(text_data=json.dumps({
            "text": event["text"],
            "sender": event["sender"],
        }))


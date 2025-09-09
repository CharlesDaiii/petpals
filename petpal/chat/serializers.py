from rest_framework import serializers
from .models import Message

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "room_name", "sender", "sender_name", "text", "created_at"]
        read_only_fields = ["id", "sender", "created_at"]
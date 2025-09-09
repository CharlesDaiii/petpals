from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework import status
from django.utils.dateparse import parse_datetime

from .models import Message
from .serializers import MessageSerializer

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer


class MessageListView(APIView):
    """
    GET /chat/messages/<room>/?limit=20&before=2025-09-08T10:00:00Z
    拉取某个房间的历史消息（倒序），支持分页窗口（before游标+limit）
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, room_name):
        limit = int(request.query_params.get("limit", 20))
        before = request.query_params.get("before")

        qs = Message.objects.filter(room_name=room_name)
        if before:
            dt = parse_datetime(before)
            if dt:
                qs = qs.filter(created_at__lt=dt)

        qs = qs.order_by("-created_at")[:limit]
        data = MessageSerializer(qs, many=True).data
        return Response(data, status=status.HTTP_200_OK)


class SendMessageView(APIView):
    """
    POST /chat/messages/<room>/
    body: { "text": "hello" }
    保存消息 + 推送到对应 WebSocket 房间
    """
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request, room_name):
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"detail": "text required"}, status=status.HTTP_400_BAD_REQUEST)

        msg = Message.objects.create(
            room_name=room_name,
            sender=request.user if request.user.is_authenticated else None,
            text=text,
        )

        # 推送到 WebSocket 房间 chat_<room>
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{room_name}",
            {
                "type": "chat.message",
                "text": msg.text,
                "sender": (request.user.username if request.user.is_authenticated else "anonymous"),
                "created_at": msg.created_at.isoformat(),
            },
        )

        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
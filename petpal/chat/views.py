from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated
from rest_framework import status
from django.utils.dateparse import parse_datetime
from django.utils import timezone
from django.db.models import OuterRef
from .models import Conversation, ConversationParticipant, Message
from .serializers import ConversationSerializer, ConversationListSerializer
from .permissions import ensure_member
from .models import Message
from .serializers import MessageSerializer

from asgiref.sync import async_to_sync
from channels.layers import get_channel_layer
from django.db import transaction
from django.shortcuts import get_object_or_404

class CreateDMView(APIView):
    permission_classes = [IsAuthenticated]
    
    @transaction.atomic
    def post(self, request):
        other_id = request.data.get("user_id")

        if not other_id:
            return Response({"detail": "user_id required"}, status=400)
        if int(other_id) == request.user.id:
            return Response({"detail": "cannot create DM with yourself"}, status=400)
        a, b = sorted([request.user.id, int(other_id)])
        slug = f"dm-{a}-{b}"

        conv, created = Conversation.objects.get_or_create(
            kind=Conversation.DM,
            user_a_id=a,
            user_b_id=b,
            defaults={"title": "", "slug": slug},  # 可选
        )
        
        ConversationParticipant.objects.get_or_create(conversation=conv, user_id=a)
        ConversationParticipant.objects.get_or_create(conversation=conv, user_id=b)
        data = ConversationSerializer(conv).data
        return Response(data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)

class CreateGroupView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        title = (request.data.get("title") or "").strip() or "New Group"
        member_ids = request.data.get("members", [])  # [uid,...] 包含自己或不包含都行
        conv = Conversation.objects.create(kind=Conversation.GROUP, title=title)
        ConversationParticipant.objects.create(conversation=conv, user=request.user, role="owner")
        for uid in member_ids:
            if uid != request.user.id:
                ConversationParticipant.objects.get_or_create(conversation=conv, user_id=uid)
        return Response(ConversationSerializer(conv).data, status=201)

class ConversationMessageView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def get(self, request, id):
        conv = get_object_or_404(Conversation, id=id)
        ensure_member(request.user, conv)

        limit = int(request.query_params.get("limit", 30))
        before = request.query_params.get("before")
        qs = conv.messages.all()
        if before:
            dt = parse_datetime(before)
            if dt:
                qs = qs.filter(created_at__lt=dt)

        qs = qs.order_by("created_at")[:limit]
        data = MessageSerializer(qs, many=True).data
        return Response(data, status=status.HTTP_200_OK)


class UserConversationsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # 当前用户参与的会话
        conv_ids = ConversationParticipant.objects.filter(
            user=request.user
        ).values_list("conversation_id", flat=True)

        # 子查询：每个会话的最后一条消息 id
        last_msg_qs = (
            Message.objects
            .filter(conversation_id=OuterRef("pk"))
            .order_by("-created_at")
        )

        qs = (
            Conversation.objects
            .filter(id__in=conv_ids)
            # 预取 participants 及其关联的 user，避免 N+1
            .prefetch_related("participants__user")
            # 也可以 select_related user_a/user_b 用于 DM
        )

        # 给序列化器一个“最后消息”缓存，避免重复查库
        # （Django 不支持直接 select_related 到一条动态的“最后消息”，这里用手工缓存）
        last_msg_map = {
            conv_id: msg
            for conv_id, msg in (
                Message.objects
                .filter(conversation_id__in=conv_ids)
                .order_by("conversation_id", "-created_at")
                # .distinct("conversation_id")  # 需要 PostgreSQL；若用 SQLite 改成分组代码
                .values_list("conversation_id", "id")
            )
        }
        # 上面的 distinct 用 PG 最方便；如果不是 PG，就在 Python 里按会话分组取第一条。

        # 简单起见：直接在 Python 里补到对象上（通用写法，数据库引擎无关）
        # 获取每个会话的最后一条消息对象
        last_msgs = (
            Message.objects
            .filter(conversation_id__in=conv_ids)
            .order_by("conversation_id", "-created_at")
        )
        # 用字典只保留每个会话的第一条（最新）
        last_by_conv = {}
        for m in last_msgs:
            cid = m.conversation_id
            if cid not in last_by_conv:
                last_by_conv[cid] = m

        convs = list(qs)
        for c in convs:
            c._last_message = last_by_conv.get(c.id)

        # 右侧列表通常按最后消息时间倒序
        convs.sort(
            key=lambda c: (getattr(c._last_message, "created_at", c.created_at) or c.created_at),
            reverse=True,
        )

        data = ConversationListSerializer(convs, many=True, context={"request": request}).data
        return Response(data, status=status.HTTP_200_OK)

class MarkReadView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, conv_id):
        cp = get_object_or_404(ConversationParticipant, conversation_id=conv_id, user=request.user)
        cp.last_read_at = timezone.now()
        cp.save(update_fields=["last_read_at"])
        return Response({"ok": True})

class SendMessageView(APIView):
    permission_classes = [IsAuthenticatedOrReadOnly]

    def post(self, request, id):
        conv = get_object_or_404(Conversation, id=id)
        ensure_member(request.user, conv)
        
        text = (request.data.get("text") or "").strip()
        if not text:
            return Response({"detail": "text required"}, status=status.HTTP_400_BAD_REQUEST)

        msg = Message.objects.create(
            conversation=conv,
            sender=request.user,
            text=text,
        )

        # WS Broadcast
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f"chat_{conv.id}",
            {
                "type": "chat.message",
                "text": msg.text,
                "sender": request.user.username,
                "created_at": msg.created_at.isoformat(),
                "message_id": str(msg.id),
                "conversation_id": str(conv.id),
            },
        )

        return Response(MessageSerializer(msg).data, status=status.HTTP_201_CREATED)
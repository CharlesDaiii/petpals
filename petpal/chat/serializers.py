from rest_framework import serializers
from .models import Message, Conversation, ConversationParticipant

class ParticipantSlimSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source="user.username")
    avatar = serializers.SerializerMethodField()

    class Meta:
        model = ConversationParticipant
        fields = ["user", "username", "avatar"]
        extra_kwargs = {"user": {"read_only": True}}

    def get_avatar(self, obj):
        return None


class ConversationListSerializer(serializers.ModelSerializer):
    participants = ParticipantSlimSerializer(many=True, read_only=True)
    last_message_text = serializers.SerializerMethodField()
    last_message_at = serializers.SerializerMethodField()
    unread_count = serializers.SerializerMethodField()
    is_dm = serializers.SerializerMethodField()
    other = serializers.SerializerMethodField()

    class Meta:
        model = Conversation
        fields = [
            "id", "kind", "title", "slug",
            "participants",
            "last_message_text", "last_message_at",
            "unread_count",
            "is_dm", "other",
            "created_at",
        ]

    # ------- 辅助取当前用户 -------
    @property
    def user(self):
        return self.context["request"].user

    # ------- 展示字段 -------
    def get_is_dm(self, obj):
        return obj.kind == Conversation.DM

    def get_other(self, obj):
        """1v1 返回对方的精简信息；群聊返回 None"""
        if obj.kind != Conversation.DM:
            return None
        u = self.user
        other = None
        if obj.user_a_id and obj.user_b_id:
            other = obj.user_a if obj.user_b_id == u.id else obj.user_b
        else:
            # 也可以从 participants 里找“不是我”的那位
            for p in obj.participants.all():
                if p.user_id != u.id:
                    other = p.user
                    break
        if not other:
            return None
        return {
            "id": other.id,
            "username": other.username,
            "avatar": None,  # 替换为实际头像
        }

    def get_last_message_text(self, obj):
        msg = getattr(obj, "_last_message", None)
        if msg is None:
            # 如果没有预取，兜底去查一条
            msg = obj.messages.order_by("-created_at").first()
        return msg.text if msg else None

    def get_last_message_at(self, obj):
        msg = getattr(obj, "_last_message", None)
        if msg is None:
            msg = obj.messages.order_by("-created_at").first()
        return msg.created_at if msg else None

    def get_unread_count(self, obj):
        try:
            mep = next(p for p in obj.participants.all() if p.user_id == self.user.id)
        except StopIteration:
            return 0
        last_read_at = mep.last_read_at
        qs = obj.messages.exclude(sender_id=self.user.id)
        if last_read_at:
            qs = qs.filter(created_at__gt=last_read_at)
        return qs.count()

class MessageSerializer(serializers.ModelSerializer):
    sender_name = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = ["id", "conversation", "sender", "sender_name", "text", "created_at"]
        read_only_fields = ["id", "sender", "created_at"]

class ConversationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Conversation
        fields = ["id", "kind", "title", "slug", "created_at"]
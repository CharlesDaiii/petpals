from django.db import models
from django.conf import settings
import uuid

class Conversation(models.Model):
    DM = "dm"
    GROUP = "group"
    KIND_CHOICES = [(DM, "Direct"), (GROUP, "Group")]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    kind = models.CharField(max_length=10, choices=KIND_CHOICES, default=DM)
    title = models.CharField(max_length=255, blank=True)     # 群名，DM 可留空或自动生成
    slug = models.SlugField(max_length=255, unique=True, blank=True)  # 可选：对外可读房间名
    created_at = models.DateTimeField(auto_now_add=True)

    user_a = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, related_name="+", on_delete=models.SET_NULL)
    user_b = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, blank=True, related_name="+", on_delete=models.SET_NULL)

    class Meta:
        indexes = [models.Index(fields=["kind"])]

class Message(models.Model):
    conversation = models.ForeignKey(
        Conversation, 
        on_delete=models.CASCADE, 
        related_name="messages",
        null=False,
        blank=False,
    )
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["created_at"]

class ConversationParticipant(models.Model):
    conversation = models.ForeignKey(Conversation, on_delete=models.CASCADE, related_name="participants")
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    role = models.CharField(max_length=20, default="member")  # owner/admin/member
    joined_at = models.DateTimeField(auto_now_add=True)
    last_read_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        unique_together = (("conversation", "user"),)
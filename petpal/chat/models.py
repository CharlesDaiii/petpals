from django.db import models
from django.conf import settings

class Message(models.Model):
    room_name = models.CharField(max_length=255, db_index=True)
    sender = models.ForeignKey(settings.AUTH_USER_MODEL, null=True, on_delete=models.SET_NULL)
    text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]
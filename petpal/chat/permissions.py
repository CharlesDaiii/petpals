from rest_framework.exceptions import PermissionDenied
from .models import ConversationParticipant

def ensure_member(user, conversation):
    if not user.is_authenticated:
        raise PermissionDenied("Auth required")
    exists = ConversationParticipant.objects.filter(conversation=conversation, user=user).exists()
    if not exists:
        raise PermissionDenied("Not a member of this conversation")
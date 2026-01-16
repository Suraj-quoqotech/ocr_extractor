from django.db import models
from django.contrib.auth.models import User
from django.db.models import Q

class UserProfile(models.Model):
    ROLE_CHOICES = [
        ('user', 'User'),
        ('admin', 'Admin'),
    ]
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=10, choices=ROLE_CHOICES, default='user')
    
    # Security Questions
    security_question_1 = models.CharField(max_length=255, default="Which city would you like to live in?", editable=False)
    security_answer_1 = models.CharField(max_length=255, blank=True, null=True)
    
    security_question_2 = models.CharField(max_length=255, default="What is your favorite movie?", editable=False)
    security_answer_2 = models.CharField(max_length=255, blank=True, null=True)
    
    def __str__(self):
        return f"{self.user.username} - {self.role}"


class OCRFile(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('done', 'Done'),
        ('error', 'Error'),
    ]

    file_name = models.CharField(max_length=255)
    pdf_url = models.URLField()
    txt_url = models.URLField()
    docx_url = models.URLField()
    pdf_size = models.BigIntegerField(default=0)   # in bytes
    txt_size = models.BigIntegerField(default=0)
    docx_size = models.BigIntegerField(default=0)
    uploaded_at = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=10, choices=STATUS_CHOICES, default='pending')
    user = models.ForeignKey(User, null=True, blank=True, on_delete=models.SET_NULL)

    class Meta:
        unique_together = ('user', 'file_name')

    def __str__(self):
        return self.file_name
    
class ChatRoom(models.Model):
    """
    Represents a 1-to-1 chat between two users.
    """
    user1 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chatrooms_as_user1'
    )
    user2 = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='chatrooms_as_user2'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(
                fields=['user1', 'user2'],
                name='unique_chat_room_pair'
            )
        ]

    def __str__(self):
        return f"ChatRoom({self.user1.username}, {self.user2.username})"

    @staticmethod
    def get_or_create_room(user_a, user_b):
        """
        Always return the same room for a user pair (order independent).
        """
        room = ChatRoom.objects.filter(
            Q(user1=user_a, user2=user_b) |
            Q(user1=user_b, user2=user_a)
        ).first()

        if room:
            return room

        return ChatRoom.objects.create(user1=user_a, user2=user_b)


from django.utils import timezone

class Message(models.Model):
    room = models.ForeignKey(ChatRoom, on_delete=models.CASCADE, related_name='messages')
    sender = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sent_messages')
    content = models.TextField(blank=True)

    created_at = models.DateTimeField(auto_now_add=True, db_index=True)
    edited_at = models.DateTimeField(null=True, blank=True)  # ✅ ADD THIS

    is_read = models.BooleanField(default=False)
    deleted_for = models.ManyToManyField(User, blank=True, related_name="deleted_messages")
    is_deleted_for_everyone = models.BooleanField(default=False)
    is_edited = models.BooleanField(default=False)

    class Meta:
        ordering = ['-created_at']
        indexes = [models.Index(fields=['room', '-created_at'])]

from django.db import models
from django.contrib.auth.models import User


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
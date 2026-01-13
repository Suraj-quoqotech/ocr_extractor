from django.db import models

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
    processing_time = models.IntegerField(null=True, blank=True)  # in milliseconds
    def __str__(self):
        return self.file_name

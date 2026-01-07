from django.contrib import admin
from .models import OCRFile

@admin.register(OCRFile)
class OCRFileAdmin(admin.ModelAdmin):
    list_display = ("file_name", "status", "uploaded_at")
    list_filter = ("status", "uploaded_at")
    search_fields = ("file_name",)
    ordering = ("-uploaded_at",)

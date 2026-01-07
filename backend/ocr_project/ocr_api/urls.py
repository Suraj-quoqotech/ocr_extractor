from django.urls import path
from .views import OCRUploadView, OCRHistoryView, OCRDeleteView

urlpatterns = [
    path("upload/", OCRUploadView.as_view(), name="ocr-upload"),
    path("history/", OCRHistoryView.as_view(), name="ocr-history"),
    path("delete/<str:filename>/", OCRDeleteView.as_view(), name="ocr-delete"),
]

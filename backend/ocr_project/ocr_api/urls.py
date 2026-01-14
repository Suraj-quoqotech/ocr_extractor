from django.urls import path
from .views import OCRUploadView, OCRHistoryView, OCRDeleteView, RegisterView, OCRDownloadView
from .views import UserProfileView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

urlpatterns = [
    path("upload/", OCRUploadView.as_view(), name="ocr-upload"),
    path("history/", OCRHistoryView.as_view(), name="ocr-history"),
    path("delete/<str:filename>/", OCRDeleteView.as_view(), name="ocr-delete"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/user/", UserProfileView.as_view(), name="auth-user"),
    path("download/<str:filename>/", OCRDownloadView.as_view(), name="ocr-download"),
]
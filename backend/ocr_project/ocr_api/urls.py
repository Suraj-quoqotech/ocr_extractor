from django.urls import path
from .views import OCRUploadView, OCRHistoryView, OCRDeleteView, RegisterView, OCRDownloadView
from .views import UserProfileView, AllUsersView, DeleteUserView, CustomTokenObtainPairView
from .views import SetSecurityQuestionsView, ForgotPasswordView, ChangePasswordView
from rest_framework_simplejwt.views import TokenRefreshView

urlpatterns = [
    path("upload/", OCRUploadView.as_view(), name="ocr-upload"),
    path("history/", OCRHistoryView.as_view(), name="ocr-history"),
    path("delete/<str:filename>/", OCRDeleteView.as_view(), name="ocr-delete"),
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", CustomTokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("auth/user/", UserProfileView.as_view(), name="auth-user"),
    path("auth/users/", AllUsersView.as_view(), name="auth-users"),
    path("auth/delete-user/<str:username>/", DeleteUserView.as_view(), name="delete-user"),
    path("auth/security-questions/", SetSecurityQuestionsView.as_view(), name="security-questions"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),
    path("download/<str:filename>/", OCRDownloadView.as_view(), name="ocr-download"),
]
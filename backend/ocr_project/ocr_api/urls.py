from django.urls import path
from rest_framework_simplejwt.views import TokenRefreshView

from . import views
from .views import (
    OCRUploadView,
    OCRHistoryView,
    OCRDeleteView,
    OCRDownloadView,
    RegisterView,
    UserProfileView,
    AllUsersView,
    DeleteUserView,
    CustomTokenObtainPairView,
    SetSecurityQuestionsView,
    ForgotPasswordView,
    ChangePasswordView,
)

urlpatterns = [
    # =========================
    # OCR
    # =========================
    path("upload/", OCRUploadView.as_view(), name="ocr-upload"),
    path("history/", OCRHistoryView.as_view(), name="ocr-history"),
    path("delete/<str:filename>/", OCRDeleteView.as_view(), name="ocr-delete"),
    path("download/<str:filename>/", OCRDownloadView.as_view(), name="ocr-download"),

    # =========================
    # AUTH
    # =========================
    path("auth/register/", RegisterView.as_view(), name="auth-register"),
    path("auth/token/", CustomTokenObtainPairView.as_view(), name="token-obtain"),
    path("auth/token/refresh/", TokenRefreshView.as_view(), name="token-refresh"),
    path("auth/user/", UserProfileView.as_view(), name="auth-user"),
    path("auth/users/", AllUsersView.as_view(), name="auth-users"),
    path("auth/delete-user/<str:username>/", DeleteUserView.as_view(), name="delete-user"),
    path("auth/security-questions/", SetSecurityQuestionsView.as_view(), name="security-questions"),
    path("auth/forgot-password/", ForgotPasswordView.as_view(), name="forgot-password"),
    path("auth/change-password/", ChangePasswordView.as_view(), name="change-password"),

    # =========================
    # CHATS
    # =========================
    path("chat/users/", views.chat_users),
    path("chat/room/", views.get_or_create_chat_room),
    path("chat/messages/<int:room_id>/", views.chat_messages),

    # DELETE OPTIONS
    path(
        "chat/messages/<int:message_id>/delete-for-me/",
        views.delete_message_for_me,
        name="delete_message_for_me"
    ),
    path(
        "chat/messages/<int:message_id>/delete-for-everyone/",
        views.delete_message_for_everyone,
        name="delete_message_for_everyone"
    ),

    # EDIT MESSAGE
    path(
        "chat/messages/<int:message_id>/edit/",
        views.edit_message,
        name="edit_message"
    ),
]

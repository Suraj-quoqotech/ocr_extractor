from django.contrib import admin
from django.contrib.auth.models import User
from django.utils.html import format_html
from django.db.models import Sum, Count, Q
from django.utils.dateformat import format as date_format
from .models import OCRFile, UserProfile
from datetime import datetime


class OCRFileInline(admin.TabularInline):
    model = OCRFile
    extra = 0
    readonly_fields = ("file_name", "status", "uploaded_at", "pdf_size", "txt_size", "docx_size")
    fields = ("file_name", "status", "uploaded_at")
    can_delete = True


class UserProfileInline(admin.StackedInline):
    model = UserProfile
    extra = 0
    readonly_fields = ("user",)


class OCRFileAdmin(admin.ModelAdmin):
    list_display = ("file_name", "status_badge", "user_link", "formatted_date", "formatted_total_size")
    list_filter = ("status", "uploaded_at", "user")
    search_fields = ("file_name", "user__username", "user__email")
    ordering = ("-uploaded_at",)
    readonly_fields = ("uploaded_at", "formatted_date", "formatted_total_size", "file_size_breakdown")
    fieldsets = (
        ("Document Information", {
            "fields": ("file_name", "status", "user")
        }),
        ("Files & URLs", {
            "fields": ("pdf_url", "txt_url", "docx_url"),
            "classes": ("collapse",)
        }),
        ("Storage Details", {
            "fields": ("pdf_size", "txt_size", "docx_size", "formatted_total_size", "file_size_breakdown")
        }),
        ("Timestamps", {
            "fields": ("uploaded_at", "formatted_date"),
            "classes": ("collapse",)
        }),
    )
    
    def status_badge(self, obj):
        colors = {
            'done': '#28a745',
            'pending': '#ffc107',
            'error': '#dc3545'
        }
        color = colors.get(obj.status, '#6c757d')
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_status_display()
        )
    status_badge.short_description = "Status"
    
    def formatted_date(self, obj):
        return date_format(obj.uploaded_at, "M d, Y - g:i A")
    formatted_date.short_description = "Uploaded On"
    
    def formatted_total_size(self, obj):
        total = obj.pdf_size + obj.txt_size + obj.docx_size
        return self._format_bytes(total)
    formatted_total_size.short_description = "Total Size"
    
    def file_size_breakdown(self, obj):
        pdf = self._format_bytes(obj.pdf_size)
        txt = self._format_bytes(obj.txt_size)
        docx = self._format_bytes(obj.docx_size)
        return f"<strong>PDF:</strong> {pdf} | <strong>TXT:</strong> {txt} | <strong>DOCX:</strong> {docx}"
    file_size_breakdown.short_description = "File Size Breakdown"
    
    def user_link(self, obj):
        if obj.user:
            return format_html('<strong>{}</strong> ({})', obj.user.username, obj.user.email)
        return "—"
    user_link.short_description = "User"
    
    @staticmethod
    def _format_bytes(bytes_size):
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.2f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.2f} TB"


@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("username_display", "role_badge", "user_email", "security_status_badge", "total_uploads", "total_storage")
    list_filter = ("role", "user__date_joined")
    search_fields = ("user__username", "user__email")
    readonly_fields = ("user", "total_uploads", "total_storage", "upload_stats", "security_question_1", "security_question_2")
    fieldsets = (
        ("User Information", {
            "fields": ("user", "role")
        }),
        ("Security Questions", {
            "fields": ("security_question_1", "security_answer_1", "security_question_2", "security_answer_2"),
            "description": "Users set these answers during profile setup for password recovery"
        }),
        ("Upload Statistics", {
            "fields": ("total_uploads", "total_storage", "upload_stats")
        }),
    )
    
    def username_display(self, obj):
        return format_html('<strong>{}</strong>', obj.user.username)
    username_display.short_description = "Username"
    
    def security_status_badge(self, obj):
        is_set = obj.security_answer_1 and obj.security_answer_2
        color = '#28a745' if is_set else '#ffc107'
        status = '✓ Set' if is_set else '⚠ Not Set'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            status
        )
    security_status_badge.short_description = "Security Status"
    
    def user_email(self, obj):
        return obj.user.email
    user_email.short_description = "Email"
    
    def role_badge(self, obj):
        color = '#007bff' if obj.role == 'admin' else '#17a2b8'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 5px 10px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            obj.get_role_display()
        )
    role_badge.short_description = "Role"
    
    def total_uploads(self, obj):
        count = OCRFile.objects.filter(user=obj.user).count()
        return format_html('<span style="font-weight: bold; color: #007bff;">{}</span>', count)
    total_uploads.short_description = "Total Uploads"
    
    def total_storage(self, obj):
        stats = OCRFile.objects.filter(user=obj.user).aggregate(
            pdf=Sum('pdf_size'),
            txt=Sum('txt_size'),
            docx=Sum('docx_size')
        )
        total = (stats['pdf'] or 0) + (stats['txt'] or 0) + (stats['docx'] or 0)
        return self._format_bytes(total)
    total_storage.short_description = "Total Storage Used"
    
    def upload_stats(self, obj):
        stats = OCRFile.objects.filter(user=obj.user).values('status').annotate(count=Count('status'))
        stats_dict = {s['status']: s['count'] for s in stats}
        return format_html(
            '<div style="padding: 10px; background-color: #f8f9fa; border-radius: 3px;">'
            '<p><strong style="color: #28a745;">✓ Completed:</strong> {}</p>'
            '<p><strong style="color: #ffc107;">⏳ Pending:</strong> {}</p>'
            '<p><strong style="color: #dc3545;">✗ Error:</strong> {}</p>'
            '</div>',
            stats_dict.get('done', 0),
            stats_dict.get('pending', 0),
            stats_dict.get('error', 0)
        )
    upload_stats.short_description = "Upload Status Summary"
    
    @staticmethod
    def _format_bytes(bytes_size):
        if not bytes_size:
            return "0 B"
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.2f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.2f} TB"


class UserAdmin(admin.ModelAdmin):
    list_display = ("username_bold", "email_display", "is_staff_badge", "is_superuser_badge", "formatted_join_date", "last_login_display")
    list_filter = ("is_staff", "is_superuser", "date_joined", "last_login")
    search_fields = ("username", "email", "first_name", "last_name")
    ordering = ("-date_joined",)
    readonly_fields = ("date_joined", "last_login", "formatted_join_date", "formatted_last_login", "user_stats")
    fieldsets = (
        ("Personal Info", {
            "fields": ("username", "email", "first_name", "last_name")
        }),
        ("Permissions", {
            "fields": ("is_active", "is_staff", "is_superuser", "groups", "user_permissions"),
            "classes": ("collapse",)
        }),
        ("Important Dates", {
            "fields": ("date_joined", "formatted_join_date", "last_login", "formatted_last_login"),
            "classes": ("collapse",)
        }),
        ("Activity", {
            "fields": ("user_stats",),
        }),
    )
    inlines = [UserProfileInline, OCRFileInline]
    
    def username_bold(self, obj):
        return format_html('<strong style="font-size: 14px;">{}</strong>', obj.username)
    username_bold.short_description = "Username"
    
    def email_display(self, obj):
        return format_html('<a href="mailto:{}">{}</a>', obj.email, obj.email)
    email_display.short_description = "Email"
    
    def is_staff_badge(self, obj):
        color = '#28a745' if obj.is_staff else '#6c757d'
        status = '✓ Yes' if obj.is_staff else '✗ No'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px;">{}</span>',
            color,
            status
        )
    is_staff_badge.short_description = "Staff"
    
    def is_superuser_badge(self, obj):
        color = '#dc3545' if obj.is_superuser else '#6c757d'
        status = '👑 Admin' if obj.is_superuser else 'User'
        return format_html(
            '<span style="background-color: {}; color: white; padding: 3px 8px; border-radius: 3px; font-weight: bold;">{}</span>',
            color,
            status
        )
    is_superuser_badge.short_description = "Role"
    
    def formatted_join_date(self, obj):
        return date_format(obj.date_joined, "M d, Y - g:i A")
    formatted_join_date.short_description = "Joined On"
    
    def formatted_last_login(self, obj):
        if obj.last_login:
            return date_format(obj.last_login, "M d, Y - g:i A")
        return "Never"
    formatted_last_login.short_description = "Last Login"
    
    def last_login_display(self, obj):
        if obj.last_login:
            return date_format(obj.last_login, "M d, Y - g:i A")
        return "—"
    last_login_display.short_description = "Last Login"
    
    def user_stats(self, obj):
        file_stats = OCRFile.objects.filter(user=obj).aggregate(
            count=Count('id'),
            total_size=Sum('pdf_size') + Sum('txt_size') + Sum('docx_size')
        )
        total_files = file_stats['count'] or 0
        total_size = file_stats['total_size'] or 0
        formatted_size = self._format_bytes(total_size)
        
        status_stats = OCRFile.objects.filter(user=obj).values('status').annotate(count=Count('status'))
        stats_dict = {s['status']: s['count'] for s in status_stats}
        
        return format_html(
            '<div style="padding: 10px; background-color: #f8f9fa; border-radius: 3px;">'
            '<p><strong>Total Documents:</strong> {}</p>'
            '<p><strong>Storage Used:</strong> {}</p>'
            '<p><strong style="color: #28a745;">✓ Completed:</strong> {}</p>'
            '<p><strong style="color: #ffc107;">⏳ Pending:</strong> {}</p>'
            '<p><strong style="color: #dc3545;">✗ Error:</strong> {}</p>'
            '</div>',
            total_files,
            formatted_size,
            stats_dict.get('done', 0),
            stats_dict.get('pending', 0),
            stats_dict.get('error', 0)
        )
    user_stats.short_description = "Activity Statistics"
    
    @staticmethod
    def _format_bytes(bytes_size):
        if not bytes_size:
            return "0 B"
        for unit in ['B', 'KB', 'MB', 'GB']:
            if bytes_size < 1024.0:
                return f"{bytes_size:.2f} {unit}"
            bytes_size /= 1024.0
        return f"{bytes_size:.2f} TB"


admin.site.unregister(User)
admin.site.register(User, UserAdmin)

# Customize admin site
admin.site.site_header = "OCR Extractor Admin Panel"
admin.site.site_title = "OCR Admin"
admin.site.index_title = "Welcome to OCR Extractor Administration"
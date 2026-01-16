from django.contrib.auth.models import User
from rest_framework import serializers
from .models import ChatRoom, Message

class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    security_answer_1 = serializers.CharField(max_length=255, required=True)
    security_answer_2 = serializers.CharField(max_length=255, required=True)

    class Meta:
        model = User
        fields = ("username", "email", "password", "security_answer_1", "security_answer_2")

    def validate_username(self, value):
        """Validate that username is unique (case-insensitive)"""
        if User.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError("Username already taken")
        return value

    def validate_security_answer_1(self, value):
        if not value.strip():
            raise serializers.ValidationError("Answer to question 1 cannot be empty")
        return value.lower().strip()

    def validate_security_answer_2(self, value):
        if not value.strip():
            raise serializers.ValidationError("Answer to question 2 cannot be empty")
        return value.lower().strip()

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data["username"],
            email=validated_data.get("email", ""),
            password=validated_data["password"]
        )
        # Create user profile with role based on username
        role = 'admin' if validated_data["username"] == "Admin" else 'user'
        from .models import UserProfile
        UserProfile.objects.create(
            user=user, 
            role=role,
            security_answer_1=validated_data.get("security_answer_1"),
            security_answer_2=validated_data.get("security_answer_2")
        )
        return user


class SetSecurityQuestionsSerializer(serializers.Serializer):
    """Serializer to set security question answers during profile setup"""
    security_answer_1 = serializers.CharField(max_length=255, required=True)
    security_answer_2 = serializers.CharField(max_length=255, required=True)

    def validate_security_answer_1(self, value):
        if not value.strip():
            raise serializers.ValidationError("Answer to question 1 cannot be empty")
        return value.lower().strip()

    def validate_security_answer_2(self, value):
        if not value.strip():
            raise serializers.ValidationError("Answer to question 2 cannot be empty")
        return value.lower().strip()


class ForgotPasswordSerializer(serializers.Serializer):
    """Serializer for forgot password with security questions"""
    username = serializers.CharField(max_length=150, required=True)
    security_answer_1 = serializers.CharField(max_length=255, required=True)
    security_answer_2 = serializers.CharField(max_length=255, required=True)
    new_password = serializers.CharField(write_only=True, min_length=8, required=True)

    def validate(self, data):
        username = data.get('username')
        try:
            user = User.objects.get(username__iexact=username)
        except User.DoesNotExist:
            raise serializers.ValidationError({"username": "User not found"})
        
        try:
            profile = user.profile
        except:
            raise serializers.ValidationError({"security": "User profile not found"})
        
        # Validate security answers (case-insensitive)
        answer1 = data.get('security_answer_1', '').lower().strip()
        answer2 = data.get('security_answer_2', '').lower().strip()
        
        if profile.security_answer_1 is None or profile.security_answer_2 is None:
            raise serializers.ValidationError({"security": "Security questions not set for this user"})
        
        if answer1 != profile.security_answer_1.lower().strip():
            raise serializers.ValidationError({"security_answer_1": "Answer to question 1 is incorrect"})
        
        if answer2 != profile.security_answer_2.lower().strip():
            raise serializers.ValidationError({"security_answer_2": "Answer to question 2 is incorrect"})
        
        data['user'] = user
        return data


class ChangePasswordSerializer(serializers.Serializer):
    """Serializer for authenticated users to change password"""
    old_password = serializers.CharField(write_only=True, required=True)
    new_password = serializers.CharField(write_only=True, min_length=8, required=True)
    confirm_password = serializers.CharField(write_only=True, min_length=8, required=True)

    def validate(self, data):
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({"new_password": "New passwords do not match"})
        return data
    
from django.contrib.auth.models import User
from .models import ChatRoom, Message


class ChatUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username')


class ChatRoomSerializer(serializers.ModelSerializer):
    user1 = ChatUserSerializer()
    user2 = ChatUserSerializer()

    class Meta:
        model = ChatRoom
        fields = ('id', 'user1', 'user2', 'created_at')


class MessageSerializer(serializers.ModelSerializer):
    sender_username = serializers.CharField(source="sender.username", read_only=True)

    class Meta:
        model = Message
        fields = [
            "id",
            "room",
            "sender",
            "sender_username",
            "content",
            "created_at",
            "edited_at",
            "is_edited",
            "is_deleted_for_everyone",
        ]

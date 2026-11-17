from rest_framework import serializers
from django.contrib.auth import get_user_model
from django.contrib.auth.hashers import check_password
from rest_framework_simplejwt.tokens import RefreshToken
import secrets
import hashlib
import re
from django.core.cache import cache
from django.utils import timezone
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from user_side.authentication.models import User, EmailOTP

from user_side.authentication.utils import (
    create_email_otp,
    verify_otp,
    resend_email_otp
)

User = get_user_model()




class AdminLoginSerializer(serializers.Serializer):

    email = serializers.EmailField()

    password = serializers.CharField(write_only=True)

    def validate(self, data):

        email = data['email']
        password = data['password']

        user = User.objects.filter(email__iexact=email).first()

        if not user:
            raise serializers.ValidationError({
                'message': 'Invalid email or password.'
            })

        if not check_password(password, user.password):
            raise serializers.ValidationError({
                'message': 'Invalid email or password.'
            })

        # Check admin role
        if user.role != 'admin' or not user.is_superuser or not user.is_staff:
            raise serializers.ValidationError({
                'message': 'Access denied. Admin account required.'
            })

        # Check active status
        if not user.is_active:
            raise serializers.ValidationError({
                'message': 'Your account is inactive.'
            })

        # Check blocked status
        if user.is_blocked:
            raise serializers.ValidationError({
                'message': 'Your account is blocked.'
            })

        data['user'] = user

        return data

    def create(self, validated_data):

        user = validated_data['user']

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)

        return {
            'message': 'Admin login successful.',

            'user': {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'role': user.role,
            },

            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }


# Common admin checking
def get_admin_user(email=None, user_id=None):

    if email:
        return User.objects.filter(
            email__iexact=email,
            role='admin',
            is_staff=True,
            is_superuser=True,
            is_active=True,
            is_blocked=False,
            is_email_verified=True
        ).first()

    return User.objects.filter(
        id=user_id,
        role='admin',
        is_staff=True,
        is_superuser=True,
        is_active=True,
        is_blocked=False,
        is_email_verified=True
    ).first()

class ForgotPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def create(self, validated_data):

        email = validated_data['email'].strip().lower()

        admin = get_admin_user(email)

        if not admin:
            raise serializers.ValidationError({
                'email': 'No eligible admin account found with this email.'
            })

        if admin:

            create_email_otp(
                email=email,
                purpose='forgot_password',
                subject="FRAGRANCE - Admin Password Reset OTP",
                message_purpose="admin password reset"
            )

        return {
            "message": "If an admin account exists with this email, an OTP has been sent."
        }



class VerifyForgotPasswordOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    otp = serializers.CharField(
        max_length=6,
        min_length=6
    )

    @transaction.atomic
    def create(self, validated_data):

        email = validated_data['email'].strip().lower()
        otp = validated_data['otp']

        # 1. Check admin account
        admin = get_admin_user(email)

        if not admin:
            raise serializers.ValidationError({
                'email': 'Invalid email or OTP.'
            })

        # 2. Get latest OTP and lock record
        otp_record = EmailOTP.objects.select_for_update().filter(
            email__iexact=email,
            purpose='forgot_password'
        ).order_by('-created_at').first()

        if not otp_record:
            raise serializers.ValidationError({
                'otp': 'OTP not found. Please request a new OTP.'
            })

        # 3. Check expiry
        if timezone.now() >= otp_record.expires_at:

            otp_record.delete()

            raise serializers.ValidationError({
                'otp': 'OTP has expired. Please request a new OTP.'
            })

        # 4. Check maximum attempts
        if otp_record.attempts >= 5:

            otp_record.delete()

            raise serializers.ValidationError({
                'otp': 'Maximum OTP attempts reached. Please request a new OTP.'
            })

        # 5. Increase attempts
        otp_record.attempts += 1
        otp_record.save(update_fields=['attempts'])

        # 6. Verify OTP
        if not verify_otp(otp, otp_record.otp_hash):

            raise serializers.ValidationError({
                'otp': 'Invalid OTP.'
            })

        # 7. Generate temporary reset token
        reset_token = secrets.token_urlsafe(32)

        token_hash = hashlib.sha256(
            reset_token.encode()
        ).hexdigest()

        # 9. Store in cache for 5 minutes
        cache_key = f"admin_password_reset:{token_hash}"

        cache.set(
            cache_key,
            admin.id,
            timeout=300
        )

        # 10. Delete used OTP
        otp_record.delete()

        return {
            'message': 'OTP verified successfully.',
            'reset_token': reset_token
        }




class ForgotPasswordResendOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate_email(self, value):

        return value.strip().lower()

    def create(self, validated_data):

        email = validated_data['email']

        admin = get_admin_user(email)
        if not admin:
            raise serializers.ValidationError({
                'email': 'No eligible admin account found with this email.'
            })

        if admin:

            resend_email_otp(
                email=email,
                purpose='forgot_password',
                subject='FRAGRANCE - Admin Password Reset OTP',
                message_purpose='admin password reset'
            )

        return {
            'message': 'If an admin account exists with this email, an OTP has been sent.'
        }




class ResetPasswordSerializer(serializers.Serializer):

    reset_token = serializers.CharField(write_only=True )

    new_password = serializers.CharField( write_only=True)

    confirm_password = serializers.CharField(write_only=True)
        # Password validation
    def validate_new_password(self, value):

        if len(value) < 8:
            raise serializers.ValidationError(
                "Password must contain at least 8 characters."
            )

        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError(
                "Password must contain at least one uppercase letter."
            )


        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError(
                "Password must contain at least one number."
            )

        if not re.search(r'[!@#$%^&*]', value):
            raise serializers.ValidationError(
                "Password must contain at least one special character."
            )

        return value

    def validate(self, data):

        # 1. Check password matching
        if data['new_password'] != data['confirm_password']:

            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })

        # 2. Hash reset token
        token_hash = hashlib.sha256(
            data['reset_token'].encode()
        ).hexdigest()

        cache_key = f"admin_password_reset:{token_hash}"

        # 3. Get admin ID from cache
        admin_id = cache.get(cache_key)

        if not admin_id:

            raise serializers.ValidationError({
                'reset_token': 'Invalid or expired reset token.'
            })

        # 4. Find admin
        admin = get_admin_user(user_id=admin_id)

        if not admin:

            cache.delete(cache_key)

            raise serializers.ValidationError({
                'reset_token': 'Invalid reset token.'
            })

    #  Check whether new password is same as old password
        if admin.check_password(data['new_password']):

            raise serializers.ValidationError({
                'new_password': 'New password must be different from your current password.'
            })

        # 5. Validate password
        try:

            validate_password(
                data['new_password'],
                user=admin
            )

        except DjangoValidationError as error:

            raise serializers.ValidationError({
                'new_password': error.messages
            })

        data['admin'] = admin
        data['cache_key'] = cache_key

        return data

    @transaction.atomic
    def create(self, validated_data):

        admin = User.objects.select_for_update().get(
            id=validated_data['admin'].id
        )

        cache_key = validated_data['cache_key']

        # 6. Recheck admin permission
        if (
            admin.role != 'admin'
            or not admin.is_staff
            or not admin.is_superuser
            or not admin.is_active
            or admin.is_blocked
            or not admin.is_email_verified
        ):

            cache.delete(cache_key)

            raise serializers.ValidationError({
                'reset_token': 'Admin account is not eligible for password reset.'
            })

        # 7. Update password
        admin.set_password(
            validated_data['new_password']
        )

        admin.save(update_fields=['password'])

        # 8. Delete token after successful reset
        cache.delete(cache_key)

        return {
            'message': 'Admin password reset successfully.'
        }

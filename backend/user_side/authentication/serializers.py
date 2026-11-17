from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from google.oauth2 import id_token
from google.auth.transport import requests as google_requests
from django.db import transaction,IntegrityError
from django.core.cache import cache
import secrets
import hashlib
from datetime import timedelta
from cloudinary import uploader
import re
from django.contrib.auth.password_validation import validate_password
from .utils import (
    generate_referral_code,
    create_pending_signup,
    signup_cache_key,
    check_resend_otp,
    create_email_otp,
    resend_email_otp,
    verify_otp
)
from django.contrib.auth.hashers import check_password
from django.utils import timezone
from .models import User, EmailOTP
from django.core.exceptions import ValidationError as DjangoValidationError


#Normal-signup
class SignupSerializer(serializers.ModelSerializer):
    referral_code = serializers.CharField(read_only=True)
    confirm_password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = [
            'id',
            'full_name',
            'email',
            'phone_number',
            'password',
            'confirm_password',
             'referral_code'
        ]

        extra_kwargs = {
            'password': {
                'write_only': True
            }
        }


    def validate_full_name(self, value):
        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Full name is required."
            )

        if not re.fullmatch(r'[A-Za-z ]+', value):
            raise serializers.ValidationError(
                "Enter a valid full name."
            )

        return value
    
    def validate(self, data):

        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })

        data.pop('confirm_password')

        return data


    def validate_email(self, value):
        value = value.strip().lower()
        if User.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError(
                "This email is already registered."
            )

        return value

    def validate_phone_number(self, value):
        if not re.fullmatch(r'^[6-9]\d{9}$', value):
            raise serializers.ValidationError(
                "Enter a valid 10-digit Indian phone number."
            )

        return value
    def validate_password(self, value):
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
                "Password must contain at least one symbol."
            )

        return value

    def create(self, validated_data):
        return create_pending_signup(validated_data)

        


class GoogleLoginSerializer(serializers.Serializer):


    credential = serializers.CharField(write_only=True)

    # Validate Google token and identify user
    def validate(self, data):
        try:
            google_user = id_token.verify_oauth2_token(
                data["credential"],
                google_requests.Request(),
                settings.GOOGLE_CLIENT_ID,
            )
        except ValueError:
            raise serializers.ValidationError({
                "credential": "Invalid Google token."
            })
        
       # Get Google user details
        email = google_user.get("email")
        google_id = google_user.get("sub")
        email_verified = google_user.get("email_verified", False)
        name = google_user.get("name", "")
        profile_picture = google_user.get("picture")

        if not email or email_verified is not True or not google_id:
            raise serializers.ValidationError({
                "credential": "Valid Google account details are required."
            })

        # Find user using Google ID
        user = User.objects.filter( google_id=google_id).first()

        if user is None:
            # Check whether email already belongs to another account
            existing_user = User.objects.filter(email__iexact=email ).first()

            if existing_user:
                raise serializers.ValidationError({
                    "email": "An account already exists with this email. Please use the existing login method."
                })

            user = User.objects.create(
                full_name=name or email,
                email=email,
                google_id=google_id,
                profile_picture=profile_picture,
                role="customer",
                is_email_verified=True,
                referral_code=generate_referral_code()
            )

            user.set_unusable_password()
            user.save()

            data["is_new_user"] = True

        else:
            data["is_new_user"] = False


        # Check account status
        if not user.is_active:
            raise serializers.ValidationError({
                "detail": "This account is inactive."
            })

        if user.is_blocked:
            raise serializers.ValidationError({
                "detail": "This account is blocked."
            })

        # Store user
        data["user"] = user

        return data

    # Generate JWT tokens
    def create(self, validated_data):

        user = validated_data["user"]
        is_new_user = validated_data["is_new_user"]

        refresh = RefreshToken.for_user(user)

        return {
            "message": (
                "Google signup successful."
                if is_new_user
                else "Google login successful."
            ),

            "is_new_user": is_new_user,

            "user": {
                "id": user.id,
                "full_name": user.full_name,
                "email": user.email,
                "profile_picture": user.profile_picture,
                "role": user.role,
                "referral_code": user.referral_code,
            },

            "access": str(refresh.access_token),
            "refresh": str(refresh),
        }



class VerifyOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6,max_length=6)

    def create(self, validated_data):

        email = validated_data["email"].strip().lower()
        otp = validated_data["otp"]

        # 1. Get pending signup details from cache
        key = signup_cache_key(email)
        pending_data = cache.get(key)

        if not pending_data:
            raise serializers.ValidationError({
                "email": "Signup session expired. Please signup again."
            })

        # 2. Get signup OTP from database
        otp_record = EmailOTP.objects.filter(
            email__iexact=email,
            purpose="signup",
            verified_at__isnull=True
        ).order_by("-created_at").first()

        if not otp_record:
            raise serializers.ValidationError({
                "otp": "OTP not found. Please request a new OTP."
            })

        # 3. Check OTP expiry
        if timezone.now() >= otp_record.expires_at:
            raise serializers.ValidationError({
                "otp": "OTP has expired. Please request a new OTP."
            })

        # 4. Check maximum attempts
        if otp_record.attempts >= 5:
            raise serializers.ValidationError({
                "otp": "Maximum attempts reached. Please resend OTP."
            })

        # 5. Verify OTP
        if not verify_otp(otp, otp_record.otp_hash):

            otp_record.attempts += 1

            otp_record.save(update_fields=["attempts"])

            raise serializers.ValidationError({
                "otp": "Invalid OTP."
            })

        # 6. Create User only after successful OTP verification
        try:

            with transaction.atomic():

                # Prevent duplicate account creation
                if User.objects.filter(email__iexact=email).exists():
                    raise serializers.ValidationError({
                        "email": "This email is already registered."
                    })

                # Create permanent user
                user = User.objects.create(
                    full_name=pending_data["full_name"],
                    email=email,
                    phone_number=pending_data.get("phone_number"),
                    password=pending_data["password_hash"],
                    role="customer",
                    referral_code=generate_referral_code(),
                    is_email_verified=True
                )

                # Mark OTP as verified
                otp_record.verified_at = timezone.now()
                otp_record.save(update_fields=["verified_at"])

                # Delete verified OTP
                otp_record.delete()

        except IntegrityError:
            raise serializers.ValidationError({
                "email": "This email is already registered."
            })

        # 7. Remove temporary signup details
        cache.delete(key)

        return user




class ResendOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate_email(self, value):

        value = value.strip().lower()

        # Check pending signup
        key = signup_cache_key(value)

        pending_data = cache.get(key)

        if not pending_data:

            raise serializers.ValidationError(
                "Pending signup not found. Please signup again."
            )

        return value

    def create(self, validated_data):

        email = validated_data['email']

        # Resend signup OTP
        otp_record = resend_email_otp(
            email=email,
            purpose='signup',
            subject='FRAGRANCE - Email Verification',
            message_purpose='verification'
        )

        if otp_record is None:

            raise serializers.ValidationError(
                "Please wait 25 seconds before requesting a new OTP."
            )

        return {
            'message': 'OTP resent successfully.'
        }


class LoginSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True )

    def validate(self, data):

        email = data['email']
        password = data['password']

        # Find user using email
        user = User.objects.filter(email__iexact=email ).first()

        if not user:
            raise serializers.ValidationError({
                'message': 'Invalid email or password.'
            })

        # Check user role
        if user.role != 'customer':
            raise serializers.ValidationError({
                'message': 'Admin cannot login through customer login.'
            })

        # Check password
        if not check_password(password, user.password):
            raise serializers.ValidationError({
                'message': 'Invalid email or password.'
            })

        # Check email verification
        if not user.is_email_verified:
            raise serializers.ValidationError({
                'message': 'Please verify your email first.'
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
            'message': 'Login successful.',

            'user': {
                'id': user.id,
                'full_name': user.full_name,
                'email': user.email,
                'phone_number': user.phone_number,
                'role': user.role,
                'referral_code': user.referral_code,
            },

            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }



class ForgotPasswordSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate(self, data):
        email=data['email']
        user = User.objects.filter(email__iexact=email, is_active=True ).first()

        if not user:
            raise serializers.ValidationError({'message': 'This account is not registered.'})
        return data



    def create(self, validated_data):

        email = validated_data['email'].strip().lower()

        user = User.objects.filter(email__iexact=email, is_active=True ).first()

      

        if user:

            create_email_otp(
                email=email,
                purpose='forgot_password',
                subject="FRAGRANCE - Password Reset OTP",
                message_purpose="password reset"
            )

        return {
            "message": "If an account exists with this email, an OTP has been sent."
        }


class VerifyForgotPasswordOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()
    otp = serializers.CharField(min_length=6,max_length=6)

    def create(self, validated_data):

        email = validated_data["email"].strip().lower()
        otp = validated_data["otp"]

        # 1. Find active user
        user = User.objects.filter(
            email__iexact=email,
            is_active=True
        ).first()

        if not user:
            raise serializers.ValidationError({
                "email": "Invalid email or OTP."
            })

        # 2. Get latest forgot password OTP
        otp_record = EmailOTP.objects.filter(
            email__iexact=email,
            purpose="forgot_password"
        ).order_by("-created_at").first()

        if not otp_record:
            raise serializers.ValidationError({
                "otp": "OTP not found. Please request a new OTP."
            })

        # 3. Check OTP expiry
        if timezone.now() >= otp_record.expires_at:
            raise serializers.ValidationError({
                "otp": "OTP has expired. Please request a new OTP."
            })

        # 4. Check maximum attempts
        if otp_record.attempts >= 5:
            raise serializers.ValidationError({
                "otp": "Maximum OTP attempts reached. Please request a new OTP."
            })

        # 5. Verify OTP
        if not verify_otp(otp, otp_record.otp_hash):

            otp_record.attempts += 1

            otp_record.save(update_fields=["attempts"])

            raise serializers.ValidationError({
                "otp": "Invalid OTP."
            })

        # 6. Generate temporary reset token
        reset_token = secrets.token_urlsafe(32)

        token_hash = hashlib.sha256(
            reset_token.encode()
        ).hexdigest()

        # 7. Store reset token in cache for 5 minutes
        cache_key = f"password_reset:{token_hash}"

        cache.set(
            cache_key,
            user.id,
            timeout=300
        )

        # 8. Delete used OTP
        otp_record.delete()

        return {
            "message": "OTP verified successfully.",
            "reset_token": reset_token
        }



class ForgotPasswordResendOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    def validate_email(self, value):

        return value.strip().lower()

    def create(self, validated_data):

        email = validated_data['email']

        # Check active user
        user = User.objects.filter(email__iexact=email,is_active=True ).first()

        if user:

            otp_record = resend_email_otp(
                email=email,
                purpose='forgot_password',
                subject='FRAGRANCE - Password Reset OTP',
                message_purpose='password reset'
            )

        return {
            'message': 'If an account exists with this email, an OTP has been sent.'
        }







class ResetPasswordSerializer(serializers.Serializer):

    reset_token = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField( write_only=True)

    def validate(self, data):

        # Check password matching
        if data['new_password'] != data['confirm_password']:

            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })
        
        # Hash reset token to find cache key
        token_hash = hashlib.sha256(
            data['reset_token'].encode()
        ).hexdigest()

        cache_key = f"password_reset:{token_hash}"

        # Get user ID from cache
        user_id = cache.get(cache_key)

        if not user_id:

            raise serializers.ValidationError({
                'reset_token': 'Invalid or expired reset token.'
            })

        # Find user
        user = User.objects.filter(id=user_id, is_active=True ).first()

        if not user:
            cache.delete(cache_key)
            raise serializers.ValidationError({
                'reset_token': 'Invalid reset token.'
            })

        #validate pasword
        password = data['new_password']

        # Check new password is same as current password
        if user.check_password(password):
            raise serializers.ValidationError({
                'new_password': 'New password cannot be the same as your current password.'
            })
        

        if len(password) < 8:
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least 8 characters.'
            })

        if not re.search(r'[A-Z]', password):
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least one uppercase letter.'
            })

        if not re.search(r'[0-9]', password):
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least one number.'
            })

        if not re.search(r'[!@#$%^&*]', password):
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least one symbol.'
            })

        data['user'] = user
        data['cache_key'] = cache_key

        return data

    def create(self, validated_data):

        user = validated_data['user']

        cache_key = validated_data['cache_key']

        # Set new password
        user.set_password(
            validated_data['new_password']
        )

        user.save(update_fields=['password'])

        # Delete reset token after successful password reset
        cache.delete(cache_key)

        return {
            'message': 'Password reset successfully.'
        }






# user profile serializers -------------------------------------------

# 1. Fetch Profile
class ProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = [
            'full_name',
            'email',
            'phone_number',
            'profile_picture',
            'google_id'
        ]




# 2. Update Profile
class UpdateProfileSerializer(serializers.ModelSerializer):

    profile_picture = serializers.ImageField(required=False)

    class Meta:
        model = User
        fields = [
            'full_name',
            'phone_number',
            'profile_picture'
        ]

    def validate_full_name(self, value):

        if not value.strip():
            raise serializers.ValidationError(
                "Full name cannot be empty."
            )
        if len(value) < 3:
            raise serializers.ValidationError(
                "Full name must contain at least 3 characters."
            )


        return value.strip()

    def validate_phone_number(self, value):

        if value and (
            not value.isdigit() or len(value) != 10
        ):
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        return value

    def update(self, instance, validated_data):

        image = validated_data.pop('profile_picture', None)

        old_public_id = instance.profile_picture_public_id

        if image:

            result = uploader.upload(
                image,
                folder="fragrance/profile_pictures",
                resource_type="image"
            )

            instance.profile_picture = result['secure_url']
            instance.profile_picture_public_id = result['public_id']

        for field, value in validated_data.items():
            setattr(instance, field, value)

        instance.save()

        if image and old_public_id:
            uploader.destroy(old_public_id)

        return instance





def check_google_account(user):

    if user.google_id:
        raise serializers.ValidationError(
            "This option is not available for Google accounts."
        )




# 7. Change Password----------------------------------------------------------

class ChangePasswordSerializer(serializers.Serializer):

    current_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)

    def validate(self, data):

        user = self.context['request'].user
        check_google_account(user)

        # Check current password
        if not user.check_password(data['current_password']):
            raise serializers.ValidationError({
                "current_password": "Current password is incorrect."
            })

        # Check confirm password
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                "confirm_password": "Passwords do not match."
            })

        # Check new password is different
        if user.check_password(data['new_password']):
            raise serializers.ValidationError({
                "new_password": "New password must be different."
            })

        return data

    # password validation
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
                "Password must contain at least one symbol."
            )

        return value
    
# Profile Forgot Password - Send OTP

class ProfileForgotPasswordSerializer(serializers.Serializer):

    def validate(self, data):

        request = self.context.get('request')

        if not request or not request.user.is_authenticated:
            raise serializers.ValidationError({
                'detail': 'Authentication required.'
            })

        user = request.user

        # Check resend cooldown
        otp_record = EmailOTP.objects.filter(
            email__iexact=user.email,
            purpose='forgot_password'
        ).order_by('-created_at').first()

        if otp_record:

            resend_after = otp_record.created_at + timedelta(seconds=25)

            if timezone.now() < resend_after:
                raise serializers.ValidationError({
                    'message': 'Please wait 25 seconds before requesting another OTP.'
                })

        return data

    def create(self, validated_data):

        user = self.context['request'].user
        check_google_account(user)

        otp_record = create_email_otp(
            email=user.email,
            purpose='forgot_password',
            subject='FRAGRANCE - Forgot Password OTP',
            message_purpose='password reset'
        )

        if not otp_record:
            raise serializers.ValidationError({
                'message': 'Please wait 25 seconds before requesting another OTP.'
            })

        return {
            'message': 'Password reset OTP sent successfully.'
        }


# Profile Forgot Password - Verify OTP

class ProfileVerifyForgotPasswordOTPSerializer(serializers.Serializer):

    otp = serializers.CharField(max_length=6)

    def validate(self, data):

        user = self.context['request'].user
        check_google_account(user)

        otp_record = EmailOTP.objects.filter(
            email__iexact=user.email,
            purpose='forgot_password'
        ).order_by('-created_at').first()

        if not otp_record:
            raise serializers.ValidationError({
                'otp': 'OTP not found. Please request a new OTP.'
            })

        if otp_record.verified_at:
            raise serializers.ValidationError({
                'otp': 'This OTP has already been used.'
            })

        if timezone.now() > otp_record.expires_at:
            raise serializers.ValidationError({
                'otp': 'OTP has expired. Please request a new OTP.'
            })

        if otp_record.attempts >= 5:
            raise serializers.ValidationError({
                'otp': 'Maximum OTP attempts exceeded. Please request a new OTP.'
            })

        # Verify OTP
        if not check_password(data['otp'], otp_record.otp_hash):

            otp_record.attempts += 1

            otp_record.save(update_fields=['attempts'])

            raise serializers.ValidationError({
                'otp': 'Invalid OTP.'
            })

        data['otp_record'] = otp_record

        return data

    def create(self, validated_data):

        otp_record = validated_data['otp_record']

        # Mark OTP as verified
        otp_record.verified_at = timezone.now()

        otp_record.save(update_fields=['verified_at'])

        return {
            'message': 'OTP verified successfully.'
        }




# Profile Forgot Password - Resend OTP

class ProfileForgotPasswordResendOTPSerializer(serializers.Serializer):

    def validate(self, data):

        user = self.context['request'].user
        check_google_account(user)

        otp_record = EmailOTP.objects.filter(
            email__iexact=user.email,
            purpose='forgot_password'
        ).order_by('-created_at').first()

        if not otp_record:
            raise serializers.ValidationError({
                'message': 'Please request an OTP first.'
            })

        if otp_record.verified_at:
            raise serializers.ValidationError({
                'message': 'OTP already verified. Please reset your password.'
            })

        return data

    def create(self, validated_data):

        user = self.context['request'].user

        otp_record = resend_email_otp(
            email=user.email,
            purpose='forgot_password',
            subject='FRAGRANCE - Forgot Password OTP',
            message_purpose='password reset'
        )

        if otp_record is None:
            raise serializers.ValidationError({
                'message': 'Please wait 25 seconds before requesting another OTP.'
            })

        return {
            'message': 'OTP resent successfully.'
        }

# Profile Forgot Password - Reset Password
class ProfileResetPasswordSerializer(serializers.Serializer):

    new_password = serializers.CharField( write_only=True, min_length=8)

    confirm_password = serializers.CharField(write_only=True )

    def validate(self, data):

        user = self.context['request'].user
        check_google_account(user)

        # Check password match
        if data['new_password'] != data['confirm_password']:
            raise serializers.ValidationError({
                'confirm_password': 'Passwords do not match.'
            })
          # Password validation
        if len(data['new_password']) < 8:
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least 8 characters.'
            })

        if not re.search(r'[A-Z]', data['new_password']):
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least one uppercase letter.'
            })

        if not re.search(r'[0-9]', data['new_password']):
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least one number.'
            })

        if not re.search(r'[!@#$%^&*]', data['new_password']):
            raise serializers.ValidationError({
                'new_password': 'Password must contain at least one symbol.'
            })

        # Check new password is different
        if user.check_password(data['new_password']):
            raise serializers.ValidationError({
                'new_password': 'New password must be different from current password.'
            })

        # Django password validation
        try:
            validate_password(data['new_password'], user)

        except DjangoValidationError as error:
            raise serializers.ValidationError({
                'new_password': error.messages
            })

        # Get verified OTP record
        otp_record = EmailOTP.objects.filter(
            email__iexact=user.email,
            purpose='forgot_password',
            verified_at__isnull=False
        ).order_by('-verified_at').first()

        if not otp_record:
            raise serializers.ValidationError({
                'otp': 'Please verify your OTP first.'
            })

        # Check OTP expiry
        if timezone.now() > otp_record.expires_at:
            raise serializers.ValidationError({
                'otp': 'OTP has expired. Please request a new OTP.'
            })

        data['otp_record'] = otp_record

        return data

    def create(self, validated_data):

        user = self.context['request'].user

        with transaction.atomic():

            # Change password
            user.set_password(
                validated_data['new_password']
            )
            user.save(update_fields=['password'])

            # Delete used OTP records
            EmailOTP.objects.filter(
                email__iexact=user.email,
                purpose='forgot_password'
            ).delete()

        return {
            'message': 'Password reset successfully.'
        }


# email change in profile --------------------------------------------------------------------
class SendEmailChangeOTPSerializer(serializers.Serializer):

    purpose = serializers.ChoiceField(
        choices=['current_email', 'new_email']
    )

    email = serializers.EmailField(required=False)

    def validate(self, data):

        user = self.context['request'].user

        check_google_account(user)

        purpose = data['purpose']

        # CURRENT EMAIL
        if purpose == 'current_email':

            data['email'] = user.email.lower()

        # NEW EMAIL
        else:

            new_email = data.get('email')

            if not new_email:

                raise serializers.ValidationError(
                    "Please enter your new email."
                )

            new_email = new_email.strip().lower()

            # Check current email verification
            verified_otp = EmailOTP.objects.filter(
                email__iexact=user.email,
                purpose='current_email',
                verified_at__gte=timezone.now() - timedelta(minutes=10)
            ).exists()

            if not verified_otp:

                raise serializers.ValidationError(
                    "Please verify your current email first."
                )

            # New email must be different from current email
            if new_email == user.email.strip().lower():

                raise serializers.ValidationError({
                    'email': 'New email must be different from current email.'
                })


            # Check whether email already exists
            if User.objects.filter(email__iexact=new_email ).exists():

                raise serializers.ValidationError({
                    'email': 'This email is already registered.'
                })

            data['email'] = new_email

        return data

    def create(self, validated_data):

        purpose = validated_data['purpose']
        email = validated_data['email']

        # Common OTP creation
        if purpose == 'current_email':

            subject = "FRAGRANCE - Current Email Verification"
            message_purpose = "current email verification"

        else:

            subject = "FRAGRANCE - New Email Verification"
            message_purpose = "new email verification"

        otp_record = create_email_otp(
            email=email,
            purpose=purpose,
            subject=subject,
            message_purpose=message_purpose
        )

        if not otp_record:

            raise serializers.ValidationError(
                "Please wait 25 seconds before requesting another OTP."
            )

        return {
            "message": "OTP sent successfully."
        }


class VerifyEmailChangeOTPSerializer(serializers.Serializer):

    otp = serializers.CharField(min_length=6,max_length=6)

    purpose = serializers.ChoiceField(
        choices=['current_email', 'new_email']
    )
    email = serializers.EmailField(required=False)

    def validate(self, data):

        user = self.context['request'].user

        check_google_account(user)

        purpose = data['purpose']

        if purpose == 'current_email':

            email = user.email.lower()

        else:

            email = data.get('email')

            if not email:
                raise serializers.ValidationError({
                    'email': 'New email is required.'
                })

            email = email.strip().lower()

            # Check same email
            if email == user.email.lower():

                raise serializers.ValidationError(
                    "New email must be different from current email."
                )

            # Check current email verification
            current_otp = EmailOTP.objects.filter(
                email__iexact=user.email,
                purpose='current_email',
                verified_at__gte=timezone.now() - timedelta(minutes=10)
            ).order_by('-verified_at').first()

            if not current_otp:

                raise serializers.ValidationError(
                    "Please verify your current email first."
                )

            # Check email uniqueness
            if User.objects.filter(email__iexact=email).exclude(pk=user.pk).exists():

                raise serializers.ValidationError(
                    "This email is already registered."
                )

        # Find OTP
        otp_record = EmailOTP.objects.filter(
            email__iexact=email,
            purpose=purpose
        ).order_by('-created_at').first()

        if not otp_record:

            raise serializers.ValidationError(
                "OTP not found. Please request a new OTP."
            )

        # Check already verified
        if otp_record.verified_at:

            raise serializers.ValidationError(
                "OTP has already been verified."
            )

        # Check expiry
        if timezone.now() >= otp_record.expires_at:

            otp_record.delete()

            raise serializers.ValidationError(
                "OTP has expired."
            )

        # Check attempts
        if otp_record.attempts >= 5:

            raise serializers.ValidationError(
                "Maximum OTP attempts exceeded. Request a new OTP."
            )

        # Verify OTP
        if not verify_otp(data['otp'], otp_record.otp_hash):

            otp_record.attempts += 1

            otp_record.save(update_fields=['attempts'])

            raise serializers.ValidationError(
                "Invalid OTP."
            )

        data['email'] = email
        data['otp_record'] = otp_record

        return data

    @transaction.atomic
    def create(self, validated_data):

        user = self.context['request'].user

        otp_record = validated_data['otp_record']

        purpose = validated_data['purpose']

        # CURRENT EMAIL VERIFICATION
        if purpose == 'current_email':

            otp_record.verified_at = timezone.now()

            otp_record.save(update_fields=['verified_at'])

            return {
                'message': 'Current email verified successfully.',
                'verified': True
            }

        # NEW EMAIL UPDATE
        old_email = user.email

        user.email = otp_record.email
        user.is_email_verified = True

        user.save(update_fields=[
            'email',
            'is_email_verified',
            'updated_at'
        ])

        # Delete related OTP records
        EmailOTP.objects.filter(
            email__in=[old_email, user.email],
            purpose__in=['current_email', 'new_email']
        ).delete()

        return {
            'message': 'Email address updated successfully.',
            'email': user.email,
            'verified': True
        }




class ProfileEmailResendOTPSerializer(serializers.Serializer):

    email = serializers.EmailField()

    purpose = serializers.ChoiceField(
        choices=[
            'current_email',
            'new_email',
        ]
    )

    def validate(self, data):

        email = data['email'].strip().lower()
        purpose = data['purpose']

        request = self.context.get('request')

        # Check authentication
        if not request or not request.user.is_authenticated:

            raise serializers.ValidationError({
                'detail': 'Authentication required.'
            })

        user = request.user
        check_google_account(user)

        # Current email verification
        if purpose == 'current_email':

            if user.email.lower() != email:

                raise serializers.ValidationError({
                    'email': 'Invalid email address.'
                })

        # New email verification
        elif purpose == 'new_email':

            # Check current email verification
            current_otp = EmailOTP.objects.filter(
                email__iexact=user.email,
                purpose='current_email',
                verified_at__gte=timezone.now() - timedelta(minutes=10)
            ).exists()

            if not current_otp:

                raise serializers.ValidationError({
                    'email': 'Please verify your current email first.'
                })

            if email == user.email.lower():

                raise serializers.ValidationError({
                    'email': 'This is already your current email.'
                })

            if User.objects.filter(email__iexact=email).exists():

                raise serializers.ValidationError({
                    'email': 'This email is already registered.'
                })

        data['email'] = email

        return data

    def create(self, validated_data):

        email = validated_data['email']
        purpose = validated_data['purpose']

        otp_details = {

            'current_email': (
                'FRAGRANCE - Current Email Verification',
                'current email verification'
            ),

            'new_email': (
                'FRAGRANCE - New Email Verification',
                'new email verification'
            ),

        }

        subject, message_purpose = otp_details[purpose]

        otp_record = resend_email_otp(
            email=email,
            purpose=purpose,
            subject=subject,
            message_purpose=message_purpose
        )

        if otp_record is None:

            raise serializers.ValidationError({
                'message': 'Please wait 25 seconds before requesting a new OTP.'
            })

        return {
            'message': 'OTP resent successfully.'
        }


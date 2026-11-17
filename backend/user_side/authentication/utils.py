

import secrets
import string

from datetime import timedelta

from django.conf import settings
from django.core.cache import cache
from django.core.mail import send_mail
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone

from .models import User, EmailOTP



#generate referrel
def generate_referral_code():
    while True:
        code = 'FRG' + ''.join(
            secrets.choice(string.ascii_uppercase + string.digits)
            for _ in range(8)
        )
        if not User.objects.filter(referral_code=code).exists():
            return code



#generate otp
def generate_otp():

    otp = str(secrets.randbelow(900000) + 100000)
    otp_hash = make_password(otp)
    expires_at = timezone.now() + timedelta(minutes=5)
    return otp, otp_hash, expires_at



#send otp
def send_otp(email, otp, subject, purpose):
    send_mail(
        subject=subject,
        message=(
            f"Your {purpose} OTP is {otp}. "
            "It expires in 5 minutes."
        ),
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        fail_silently=False
    )



#verify otp
def verify_otp(otp, otp_hash):
    return check_password(otp, otp_hash)



#signup cachekey
def signup_cache_key(email):
    email = email.strip().lower()
    return f"pending_signup:{email}"


#check resend otp
def check_resend_otp(email, purpose='signup'):

    last_otp = EmailOTP.objects.filter(
        email__iexact=email,
        purpose=purpose
    ).order_by('-created_at').first()

    if not last_otp:
        return True

    resend_after = last_otp.created_at + timedelta(seconds=25)

    return timezone.now() >= resend_after


#create pending signup 
def create_pending_signup(validated_data):

    email = validated_data['email'].strip().lower()

    key = signup_cache_key(email)

    pending_data = {

        'full_name': validated_data['full_name'],
        'email': email,
        'phone_number': validated_data.get('phone_number'),

        'password_hash': make_password(
            validated_data['password']
        ),

    }

    # Store only signup details in cache
    cache.set(
        key,
        pending_data,
        timeout=300
    )

    try:

        # Create and send OTP using common function
        create_email_otp(
            email=email,
            purpose='signup',
            subject="FRAGRANCE - Email Verification",
            message_purpose="verification"
        )

    except Exception:

        cache.delete(key)

        raise

    return {
        'email': email,
        'message': 'OTP sent successfully.'
    }



#create otp
def create_email_otp(email,purpose,subject,message_purpose,):

    email =email.strip().lower()

    # Check resend cooldown

    if not check_resend_otp(email=email,purpose=purpose,):

        return None

    # Generate OTP

    otp, otp_hash, expires_at = generate_otp()

    # Create new OTP record

    otp_record = EmailOTP.objects.create(

        email=email,
        purpose=purpose,
        otp_hash=otp_hash,
        expires_at=expires_at,
        attempts=0

    )

    # Send OTP email

    try:

        send_otp(
            email=email,
            otp=otp,
            subject=subject,
            purpose=message_purpose
        )

    except Exception:

        otp_record.delete()

        raise

    # Delete previous OTP records after successful email delivery

    EmailOTP.objects.filter(email__iexact=email,purpose=purpose).exclude(id=otp_record.id).delete()

    return otp_record


#resend otp
def resend_email_otp(
    purpose,
    subject,
    message_purpose,
    email=None
):

    return create_email_otp(
        purpose=purpose,
        subject=subject,
        message_purpose=message_purpose,
        email=email
    )





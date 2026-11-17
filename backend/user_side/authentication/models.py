
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin, BaseUserManager




class UserManager(BaseUserManager):

    def create_user(self, email, full_name, password=None, **extra_fields):

        if not email:
            raise ValueError("Email is required")

        email = self.normalize_email(email)

        user = self.model(
            email=email,
            full_name=full_name,
            **extra_fields
        )

        user.set_password(password)
        user.save(using=self._db)

        return user

    def create_superuser(self, email, full_name, password=None, **extra_fields):

        extra_fields.setdefault('role', 'admin')
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('is_active', True)
        extra_fields.setdefault('is_email_verified', True)
        extra_fields.setdefault('is_blocked', False)

        if extra_fields.get('is_staff') is not True:
            raise ValueError("Superuser must have is_staff=True")

        if extra_fields.get('is_superuser') is not True:
            raise ValueError("Superuser must have is_superuser=True")

        return self.create_user(
            email,
            full_name,
            password,
            **extra_fields
        )



class User(AbstractBaseUser, PermissionsMixin):

    full_name = models.CharField(max_length=150)
    email = models.EmailField(max_length=255, unique=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    profile_picture = models.TextField(null=True, blank=True)
    profile_picture_public_id = models.CharField( max_length=255,blank=True,null=True)
    role = models.CharField(max_length=20, default='customer')
    referral_code = models.CharField( max_length=50,unique=True,null=True, blank=True)
    is_email_verified = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_blocked = models.BooleanField(default=False)
    google_id = models.CharField(max_length=255,unique=True,null=True,blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['full_name']

    class Meta:
        db_table = 'users'

    def __str__(self):
        return self.email




class EmailOTP(models.Model):


    OTP_PURPOSE_CHOICES = [
        ('signup', 'Signup Verification'),
        ('forgot_password', 'Forgot Password'),
        ('current_email', 'Current Email Verification'),
        ('new_email', 'New Email Verification'),
        ('change_password', 'Change Password'),
    ]

    email = models.EmailField()

    purpose = models.CharField(
        max_length=30,
        choices=OTP_PURPOSE_CHOICES
    )

    otp_hash = models.CharField(max_length=128)

    expires_at = models.DateTimeField()

    attempts = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    verified_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = 'email_otps'

    def __str__(self):
        return f"{self.email} - {self.purpose}"
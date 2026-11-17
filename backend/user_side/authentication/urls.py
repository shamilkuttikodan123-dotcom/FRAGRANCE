

from django.urls import path
# from rest_framework_simplejwt.views import TokenRefreshView

from .views import (
    SignupView,
    GoogleLoginView,
    VerifyOTPView,
    ResendOTPView,
    LoginView,
    ForgotPasswordView,
    VerifyForgotPasswordOTPView,
    ResetPasswordView,
    ProfileView,
    UpdateProfileView,
    ChangePasswordView,

    SendEmailChangeOTPView,
    VerifyEmailChangeOTPView,
    ProfileEmailResendOTPView,


    ForgotPasswordResendOTPView,
    ProfileForgotPasswordView,
    ProfileVerifyForgotPasswordOTPView,
    ProfileForgotPasswordResendOTPView,
    ProfileResetPasswordView
)

urlpatterns = [

    # Authentication
    path('signup/', SignupView.as_view(), name='signup'),
    path('google/', GoogleLoginView.as_view(), name='google_signup'),
    path('verify-otp/', VerifyOTPView.as_view(), name='verify-otp'),
    path('resend-otp/', ResendOTPView.as_view(), name='resend-otp'),
    path('login/', LoginView.as_view(), name='login'),

    # Forgot Password
    path('login/forgot-password/', ForgotPasswordView.as_view(), name='forgot-password'),
    path('login/verify-reset-otp/', VerifyForgotPasswordOTPView.as_view(), name='verify-reset-otp'),
    path('login/reset-password/', ResetPasswordView.as_view(), name='reset-password'),
    path('login/resend-otp/',ForgotPasswordResendOTPView.as_view(),name='forgot-password-resend-otp'),

    # User Profile
    path('profile/', ProfileView.as_view(), name='profile'),
    path('profile/update/', UpdateProfileView.as_view(), name='update-profile'),

    #password change- profile
    path('profile/change-password/', ChangePasswordView.as_view(), name='change-password'),
    path('profile/forgot-password/',ProfileForgotPasswordView.as_view(), name='profile-forgot-password'),
    path('profile/verify-forgot-password-otp/',ProfileVerifyForgotPasswordOTPView.as_view(),name='profile-verify-forgot-password-otp'),
    path('profile/resend-forgot-password-otp/',ProfileForgotPasswordResendOTPView.as_view(),name='profile-resend-forgot-password-otp'),
    path('profile/reset-password/', ProfileResetPasswordView.as_view(),name='profile-reset-password'),

    #Email change-profile
    path('profile/send-email-change-otp/',SendEmailChangeOTPView.as_view()),
    path('profile/verify-email-change-otp/',VerifyEmailChangeOTPView.as_view()),
    path( 'profile/email-resend-otp/',ProfileEmailResendOTPView.as_view()),
]

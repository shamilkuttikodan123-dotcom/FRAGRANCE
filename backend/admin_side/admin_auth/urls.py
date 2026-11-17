
from .views import AdminLoginAPIView
from django.urls import path,include


from .views import (
    ForgotPasswordAPIView,
    VerifyForgotPasswordOTPAPIView,
    ForgotPasswordResendOTPAPIView,
    ResetPasswordAPIView
)

urlpatterns = [
    path('login/', AdminLoginAPIView.as_view(), name='admin_login'),
    path('forgot-password/',ForgotPasswordAPIView.as_view(),name='admin_forgot_password'),
    path('verify-otp/',VerifyForgotPasswordOTPAPIView.as_view(),name='admin_verify_otp'),
    path('resend-otp/',ForgotPasswordResendOTPAPIView.as_view(),name='admin_resend_otp'),
    path('reset-password/',ResetPasswordAPIView.as_view(),name='admin_reset_password'),

]    



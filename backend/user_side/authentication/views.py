

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny,IsAuthenticated
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from .serializers import (
    SignupSerializer,
    GoogleLoginSerializer,
    VerifyOTPSerializer,
    ResendOTPSerializer,
    LoginSerializer,
    ForgotPasswordSerializer,
    VerifyForgotPasswordOTPSerializer,
    ResetPasswordSerializer,
    ProfileSerializer,
    UpdateProfileSerializer,
    ChangePasswordSerializer,

    SendEmailChangeOTPSerializer,
    VerifyEmailChangeOTPSerializer,
    ProfileEmailResendOTPSerializer,


    
    ForgotPasswordResendOTPSerializer,
    ProfileForgotPasswordSerializer,
    ProfileVerifyForgotPasswordOTPSerializer,
    ProfileForgotPasswordResendOTPSerializer,
    ProfileResetPasswordSerializer
)


class SignupView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = SignupSerializer(data=request.data)

        if serializer.is_valid():
            result = serializer.save()
            return Response(
                {
                    'message': result['message'],
                    'email': result['email']
                },
                status=status.HTTP_201_CREATED
            )

        return Response(
            {
                'message': 'Signup failed.',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class GoogleLoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = GoogleLoginSerializer(data=request.data)

        if serializer.is_valid():

            response_data = serializer.save()

            status_code = (
                status.HTTP_201_CREATED
                if response_data['is_new_user']
                else status.HTTP_200_OK
            )

            return Response(
                response_data,
                status=status_code
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )




class VerifyOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = VerifyOTPSerializer(data=request.data)

        if serializer.is_valid():

            serializer.save()

            return Response(
                {
                    'message': 'Email verified successfully.'
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                'message': 'OTP verification failed.',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class ResendOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ResendOTPSerializer(data=request.data)

        if serializer.is_valid():

            result = serializer.save()

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        return Response(
            {
                'message': 'OTP resend failed.',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )


class LoginView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = LoginSerializer(data=request.data)

        if serializer.is_valid():

            response_data = serializer.save()

            return Response(
                response_data,
                status=status.HTTP_200_OK
            )

        return Response(
            {
                'message': 'Login failed.',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )




class ForgotPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ForgotPasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            try:

                result = serializer.save()

                return Response(
                    result,
                    status=status.HTTP_200_OK
                )

            except Exception:

                return Response(
                    {
                        'message': 'Unable to process your request. Please try again.'
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR
                )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class VerifyForgotPasswordOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = VerifyForgotPasswordOTPSerializer(
            data=request.data
        )

        if serializer.is_valid():

            result = serializer.save()

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        return Response(
            {
                'message': 'OTP verification failed.',
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )

class ForgotPasswordResendOTPView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ForgotPasswordResendOTPSerializer(
            data=request.data
        )

        serializer.is_valid(raise_exception=True)

        result = serializer.save()

        return Response(
            result,
            status=status.HTTP_200_OK
        )

class ResetPasswordView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ResetPasswordSerializer(
            data=request.data
        )

        if serializer.is_valid():

            result = serializer.save()

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        return Response(
            {
                'errors': serializer.errors
            },
            status=status.HTTP_400_BAD_REQUEST
        )



#user profile views ------------------------------------------------------

# 1. Fetch Profile
class ProfileView(APIView):

    permission_classes = [IsAuthenticated]

    def get(self, request):

        serializer = ProfileSerializer(request.user)

        return Response(
            serializer.data,
            status=status.HTTP_200_OK
        )


# 2. Update Profile
class UpdateProfileView(APIView):

    permission_classes = [IsAuthenticated]

    parser_classes = [
        MultiPartParser,
        FormParser
    ]

    def patch(self, request):

        serializer = UpdateProfileSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
        
            serializer.save()

            return Response(
                {
                    "message": "Profile updated successfully.",
                    "data": serializer.data
                },
                status=status.HTTP_200_OK
            )
        return Response(
        serializer.errors,
        status=status.HTTP_400_BAD_REQUEST
    )



# update password views -------------------------------------------------
    
class ChangePasswordView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ChangePasswordSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():

            user = request.user

            user.set_password(
                serializer.validated_data['new_password']
            )

            user.save(update_fields=['password'])

            return Response({
                "message": "Password changed successfully."
            }, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )






class ProfileForgotPasswordView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ProfileForgotPasswordSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():

            result = serializer.save()

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ProfileVerifyForgotPasswordOTPView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ProfileVerifyForgotPasswordOTPSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():

            result = serializer.save()

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )




class ProfileForgotPasswordResendOTPView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ProfileForgotPasswordResendOTPSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():

            result = serializer.save()

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )




class ProfileResetPasswordView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ProfileResetPasswordSerializer(
            data=request.data,
            context={'request': request}
        )

        if serializer.is_valid():

            result = serializer.save()

            return Response(
                result,
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )



# change email in profile --------------------------------------------------
class SendEmailChangeOTPView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = SendEmailChangeOTPSerializer(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)

        result = serializer.save()

        return Response(
            result,
            status=status.HTTP_200_OK
        )

    
class VerifyEmailChangeOTPView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = VerifyEmailChangeOTPSerializer(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)

        result = serializer.save()

        return Response(
            result,
            status=status.HTTP_200_OK
        )


class ProfileEmailResendOTPView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request):

        serializer = ProfileEmailResendOTPSerializer(
            data=request.data,
            context={'request': request}
        )

        serializer.is_valid(raise_exception=True)

        result = serializer.save()

        return Response(
            result,
            status=status.HTTP_200_OK
        )


from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework import status

from .serializers import (
    AdminLoginSerializer,
    ForgotPasswordSerializer,
    VerifyForgotPasswordOTPSerializer,
    ForgotPasswordResendOTPSerializer,
    ResetPasswordSerializer
)



class AdminLoginAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = AdminLoginSerializer(
            data=request.data
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






class ForgotPasswordAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ForgotPasswordSerializer(
            data=request.data
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


class VerifyForgotPasswordOTPAPIView(APIView):

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
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )


class ForgotPasswordResendOTPAPIView(APIView):

    permission_classes = [AllowAny]

    def post(self, request):

        serializer = ForgotPasswordResendOTPSerializer(
            data=request.data
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


class ResetPasswordAPIView(APIView):

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
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )
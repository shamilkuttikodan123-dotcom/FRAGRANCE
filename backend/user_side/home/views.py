
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import AllowAny, IsAdminUser,IsAuthenticatedOrReadOnly

from .models import Banner
from .serializers import BannerSerializer


class MainBannerView(APIView):

    permission_classes=[IsAuthenticatedOrReadOnly]

    def get(self, request, pk=None):

        if pk is not None:
            try:
                banner = Banner.objects.get(
                    pk=pk,
                    is_hero_banner=True,
                    is_active=True
                )
            except Banner.DoesNotExist:
                return Response(
                    {"message": "Banner not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = BannerSerializer(banner)
            return Response(serializer.data, status=status.HTTP_200_OK)

        banners = Banner.objects.filter(
            is_hero_banner=True,
            is_active=True
        ).order_by("sort_order")

        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):

        serializer = BannerSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(is_hero_banner=True)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def put(self, request, pk):

        try:
            banner = Banner.objects.get(
                pk=pk,
                is_hero_banner=True
            )
        except Banner.DoesNotExist:
            return Response(
                {"message": "Banner not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BannerSerializer(banner, data=request.data)

        if serializer.is_valid():
            serializer.save(is_hero_banner=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, pk):

        try:
            banner = Banner.objects.get(
                pk=pk,
                is_hero_banner=True
            )
        except Banner.DoesNotExist:
            return Response(
                {"message": "Banner not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BannerSerializer(
            banner,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save(is_hero_banner=True)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):

        try:
            banner = Banner.objects.get(
                pk=pk,
                is_hero_banner=True
            )
        except Banner.DoesNotExist:
            return Response(
                {"message": "Banner not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        banner.delete()

        return Response(
            {"message": "Banner deleted successfully"},
            status=status.HTTP_200_OK
        )


class OtherBannerView(APIView):

    permission_classes=[IsAuthenticatedOrReadOnly]

    def get(self, request, pk=None):

        if pk is not None:
            try:
                banner = Banner.objects.get(
                    pk=pk,
                    is_hero_banner=False,
                    is_active=True
                )
            except Banner.DoesNotExist:
                return Response(
                    {"message": "Banner not found"},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = BannerSerializer(banner)
            return Response(serializer.data, status=status.HTTP_200_OK)

        banners = Banner.objects.filter(
            is_hero_banner=False,
            is_active=True
        ).order_by("sort_order")

        serializer = BannerSerializer(banners, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)

    def post(self, request):

        serializer = BannerSerializer(data=request.data)

        if serializer.is_valid():
            serializer.save(is_hero_banner=False)

            return Response(
                serializer.data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def put(self, request, pk):

        try:
            banner = Banner.objects.get(
                pk=pk,
                is_hero_banner=False
            )
        except Banner.DoesNotExist:
            return Response(
                {"message": "Banner not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BannerSerializer(banner, data=request.data)

        if serializer.is_valid():
            serializer.save(is_hero_banner=False)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def patch(self, request, pk):

        try:
            banner = Banner.objects.get(
                pk=pk,
                is_hero_banner=False
            )
        except Banner.DoesNotExist:
            return Response(
                {"message": "Banner not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = BannerSerializer(
            banner,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():
            serializer.save(is_hero_banner=False)
            return Response(serializer.data, status=status.HTTP_200_OK)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    def delete(self, request, pk):

        try:
            banner = Banner.objects.get(
                pk=pk,
                is_hero_banner=False
            )
        except Banner.DoesNotExist:
            return Response(
                {"message": "Banner not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        banner.delete()

        return Response(
            {"message": "Banner deleted successfully"},
            status=status.HTTP_200_OK
        )

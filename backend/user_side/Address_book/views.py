
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework import status
from django.db import transaction

from .models import Address
from .serializers import AddressSerializer

class AddressListCreateView(APIView):

    permission_classes = [IsAuthenticated]

    # Get all addresses OR single address
    def get(self, request, pk=None):

        if pk:

            address = Address.objects.filter(id=pk,user=request.user ).first()

            if not address:
                return Response(
                    {"message": "Address not found."},
                    status=status.HTTP_404_NOT_FOUND
                )

            serializer = AddressSerializer(address)
            return Response(serializer.data)
        

        addresses = Address.objects.filter(
            user=request.user
        ).order_by('-is_default', '-created_at')

        serializer = AddressSerializer(
            addresses,
            many=True
        )

        return Response(serializer.data)

    
        # Add new address
    def post(self, request):

        serializer = AddressSerializer(data=request.data)

        if serializer.is_valid():

            has_address = Address.objects.filter(
                user=request.user
            ).exists()

            # First address becomes default automatically
            address = serializer.save(
                user=request.user,
                is_default=not has_address
            )
            return Response(
                AddressSerializer(address).data,
                status=status.HTTP_201_CREATED
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # Edit address
    def patch(self, request, pk):

        address = Address.objects.filter(
            id=pk,
            user=request.user
        ).first()

        if not address:
            return Response(
                {"message": "Address not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = AddressSerializer(
            address,
            data=request.data,
            partial=True
        )

        if serializer.is_valid():

            with transaction.atomic():

                address = serializer.save()

                if address.is_default:
                    Address.objects.filter(
                        user=request.user
                    ).exclude(
                        id=address.id
                    ).update(is_default=False)

            return Response(serializer.data)

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )

    # Delete address
    def delete(self, request, pk):

        address = Address.objects.filter(
            id=pk,
            user=request.user
        ).first()

        if not address:
            return Response(
                {"message": "Address not found."},
                status=status.HTTP_404_NOT_FOUND
            )


        with transaction.atomic():

            was_default = address.is_default

            address.delete()

            # If deleted address was default
            if was_default:

                latest_address = Address.objects.filter(
                    user=request.user
                ).order_by('-created_at').first()

                if latest_address:

                    latest_address.is_default = True

                    latest_address.save(
                        update_fields=['is_default']
                    )
        return Response(
            {"message": "Address deleted successfully."},
            status=status.HTTP_200_OK
        )


# Set Default Address
class SetDefaultAddressView(APIView):

    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):

        address = Address.objects.filter(
            id=pk,
            user=request.user
        ).first()

        if not address:
            return Response(
                {"message": "Address not found."},
                status=status.HTTP_404_NOT_FOUND
            )

        with transaction.atomic():

            Address.objects.filter(
                user=request.user
            ).update(is_default=False)

            address.is_default = True
            address.save(update_fields=['is_default'])


        return Response(
            {
                "message": "Default address updated successfully.",
                "address": AddressSerializer(address).data
            },
            status=status.HTTP_200_OK
        )

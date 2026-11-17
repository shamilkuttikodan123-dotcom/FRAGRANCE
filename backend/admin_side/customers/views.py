from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from django.contrib.auth import get_user_model
from .serializers import CustomersSerializer,CustomerBlockSerializer
from rest_framework import status
from django.db.models import Q,Count
from rest_framework.pagination import PageNumberPagination
from rest_framework.permissions import BasePermission




class IsCustomAdmin(BasePermission):

    def has_permission(self, request, view):

        user = request.user

        return (
            user
            and user.is_authenticated
            and user.role == 'admin'
            and user.is_staff
            and user.is_superuser
            and user.is_active
            and not user.is_blocked
            and user.is_email_verified
        )

User =get_user_model()

# CUSTOMER PAGINATION

class CustomerPagination(PageNumberPagination):

    page_size = 5

    page_size_query_param = 'page_size'

    max_page_size = 50


class CustomerAPIView(APIView):

    permission_classes = [IsCustomAdmin]

    def get(self, request):

        # 1. GLOBAL CUSTOMER STATISTICS
        all_customers = User.objects.filter(role='customer')

        total_customers = all_customers.count()
        blocked_customers = all_customers.filter(is_blocked=True).count()
        not_blocked_customers = all_customers.filter(is_blocked=False).count()

        stats = {
            'total_customers': total_customers,
            'blocked_customers': blocked_customers,
            'not_blocked_customers': not_blocked_customers
        }

        # 2. SEARCH FILTER
        customers = all_customers

        search_query = request.query_params.get('search', '').strip()

        if search_query:
            customers = customers.filter(
                Q(full_name__istartswith=search_query) |
                Q(email__istartswith=search_query) |
                Q(phone_number__istartswith=search_query)
            )

        # 3. LATEST FIRST
        customers = customers.order_by('-created_at')

        # 4. PAGINATION
        paginator = CustomerPagination()

        paginated_customers = paginator.paginate_queryset(
            customers,
            request
        )

        serializer = CustomersSerializer(paginated_customers,many=True)

        response = paginator.get_paginated_response(serializer.data)

        # 5. ADD GLOBAL STATISTICS
        response.data['stats'] = stats

        return response


class CustomerBlockAPIView(APIView):

    permission_classes = [IsCustomAdmin]

    def patch(self, request, pk):

        try:
            customer = User.objects.get(id=pk, role='customer')

        except User.DoesNotExist:
            return Response(
                {
                    'success': False,
                    'message': 'Customer not found.'
                },
                status=status.HTTP_404_NOT_FOUND
            )

        # Toggle block status
        customer.is_blocked = not customer.is_blocked

        serializer = CustomerBlockSerializer(
            customer,
            data={
                'is_blocked': customer.is_blocked
            }
        )

        if serializer.is_valid():
            serializer.save()

            return Response(
                {
                    'success': True,
                    'message': (
                        'Customer blocked successfully.'
                        if customer.is_blocked
                        else 'Customer unblocked successfully.'
                    ),
                    'data': serializer.data
                },
                status=status.HTTP_200_OK
            )

        return Response(
            serializer.errors,
            status=status.HTTP_400_BAD_REQUEST
        )






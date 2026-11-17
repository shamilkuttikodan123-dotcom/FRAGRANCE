from django.urls import path
from .views import CustomerAPIView,CustomerBlockAPIView
urlpatterns = [
        path('customers/', CustomerAPIView.as_view(), name='customers-list'),
        path('customers/<int:pk>/block/',CustomerBlockAPIView.as_view(),name='customer-block'),
]
from django.urls import path

from .views import (
    AddressListCreateView,
    SetDefaultAddressView
)

urlpatterns = [

    path('address/',AddressListCreateView.as_view(),name='address-list-create'),

    path('address/<int:pk>/', AddressListCreateView.as_view(),name='address-detail'),

    path('address/set-default/<int:pk>/',SetDefaultAddressView.as_view(), name='set-default-address'),

]
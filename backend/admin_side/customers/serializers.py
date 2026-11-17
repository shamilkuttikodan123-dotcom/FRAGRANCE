
from django.contrib.auth import get_user_model

User =get_user_model()
from rest_framework import serializers

class CustomersSerializer(serializers.ModelSerializer):
    class Meta:
        model=User
        fields=[
            'id',
            'full_name',
            'email',
            'phone_number',
            'created_at',
            'is_active',
            'is_blocked',
        
            

        ]


class CustomerBlockSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ['id','is_blocked']


  
import re
from rest_framework import serializers
from .models import Address

class AddressSerializer(serializers.ModelSerializer):

    class Meta:
        model = Address

        fields = [
            'id',
            'full_name',
            'address_nickname',
            'street_address',
            'city',
            'postal_code',
            'country',
            'phone_number',
            'is_default',
            'created_at',
            'updated_at'
        ]

        read_only_fields = [
            'id',
            'created_at',
            'updated_at'
        ]

    # Full Name Validation
    def validate_full_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Full name is required."
            )

        if not re.fullmatch(r'[A-Za-z ]+', value):
            raise serializers.ValidationError(
                "Full name must contain only letters and spaces."
            )

        if len(value) < 3:
            raise serializers.ValidationError(
                "Full name must contain at least 3 characters."
            )

        return value

    # Address Nickname Validation
    def validate_address_nickname(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Address nickname is required."
            )

        if not re.fullmatch(r'[A-Za-z ]+', value):
            raise serializers.ValidationError(
                "Address nickname must contain only letters and spaces."
            )

        if len(value) < 3:
            raise serializers.ValidationError(
                "Address nickname must contain at least 3 characters."
            )

        return value

    def validate_street_address(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Street address is required."
            )
        if not re.fullmatch(r'[A-Za-z0-9 ,./#-]+', value):
            raise serializers.ValidationError(
                "Street address contains invalid characters."
            )

        if len(value) < 5:
            raise serializers.ValidationError(
                "Please enter a valid street address."
            )

        return value

    # City Validation
    def validate_city(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "City is required."
            )
        if not re.fullmatch(r'[A-Za-z ]+', value):
            raise serializers.ValidationError(
                "City must contain only letters and spaces."
            )

        return value

    # Postal Code Validation
    def validate_postal_code(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Postal code is required."
            )

        if not re.fullmatch(r'[0-9]{3,10}', value):
            raise serializers.ValidationError(
                "Please enter a valid postal code."
            )


        return value

    # Country Validation
    def validate_country(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Country is required."
            )
        if not re.fullmatch(r'[A-Za-z ]+', value):
            raise serializers.ValidationError(
                "Country must contain only letters and spaces."
            )

        return value

    # Phone Number Validation
    def validate_phone_number(self, value):

        value = value.strip()

        if not re.fullmatch(r'[0-9]{10}', value):
            raise serializers.ValidationError(
                "Phone number must contain exactly 10 digits."
            )

        return value
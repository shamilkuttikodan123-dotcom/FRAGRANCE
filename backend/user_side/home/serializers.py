
from rest_framework import serializers
from .models import Banner
import cloudinary.uploader


class BannerSerializer(serializers.ModelSerializer):

    image = serializers.ImageField(write_only=True, required=True)

    class Meta:
        model = Banner
        fields = [
            "id",
            "title",
            "image",
            "image_url",
            "link_url",
            "is_hero_banner",
            "is_active",
            "sort_order",
            "created_at"
        ]
        read_only_fields = ["id", "image_url", "created_at"]

    def create(self, validated_data):
        image = validated_data.pop("image")

        result = cloudinary.uploader.upload(image)

        validated_data["image_url"] = result["secure_url"]

        return Banner.objects.create(**validated_data)

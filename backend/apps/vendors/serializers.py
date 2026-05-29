from rest_framework import serializers

from .models import (
    Vendor,
    VendorSubscription
)


class VendorSerializer(serializers.ModelSerializer):

    user_email = serializers.CharField(
        source='user.email',
        read_only=True
    )

    class Meta:
        model = Vendor

        fields = [
            'id',
            'user',
            'user_email',
            'store_name',
            'slug',
            'description',
            'logo',
            'banner',
            'country',
            'city',
            'address',
            'is_verified',
            'created_at',
        ]


class VendorSubscriptionSerializer(
    serializers.ModelSerializer
):

    class Meta:
        model = VendorSubscription

        fields = '__all__'



class VendorRegisterSerializer(serializers.Serializer):

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    username = serializers.CharField(required=False, allow_blank=True)
    store_name = serializers.CharField()
    slug = serializers.SlugField()
    country = serializers.CharField(required=False, allow_blank=True)
    city = serializers.CharField(required=False, allow_blank=True)
    paid = serializers.BooleanField(required=False, default=False)

    def validate_email(self, value):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('User with this email already exists')
        return value

    def create(self, validated_data):

        from django.contrib.auth import get_user_model
        User = get_user_model()

        email = validated_data['email']
        password = validated_data['password']
        username = validated_data.get('username') or email

        user = User.objects.create_user(email=email, password=password, username=username, role='vendor')

        vendor = Vendor.objects.create(
            user=user,
            store_name=validated_data['store_name'],
            slug=validated_data['slug'],
            country=validated_data.get('country', ''),
            city=validated_data.get('city', ''),
        )

        return vendor


class VendorRenewSerializer(serializers.Serializer):

    vendor_id = serializers.IntegerField()
	
	
	
	
	
	
	
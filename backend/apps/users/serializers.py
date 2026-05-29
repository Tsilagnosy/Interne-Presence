from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id',
            'email',
            'username',
            'role',
            'first_name',
            'last_name',
            'phone_number',
            'country',
            'city',
        ]


class UserRegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)
    role = serializers.ChoiceField(choices=[('customer', 'Customer'), ('vendor', 'Vendor')], required=False, default='customer')

    class Meta:
        model = User
        fields = ['email', 'password', 'username', 'role', 'first_name', 'last_name', 'phone_number', 'country', 'city']
        extra_kwargs = {
            'username': {'required': False},
        }

    def validate_role(self, value):
        if value not in ('customer', 'vendor'):
            raise serializers.ValidationError('Role must be customer or vendor.')
        return value

    def create(self, validated_data):
        username = validated_data.pop('username', None) or validated_data['email']
        role = validated_data.pop('role', 'customer')
        password = validated_data.pop('password')

        user = User.objects.create_user(
            email=validated_data['email'],
            password=password,
            username=username,
            role=role,
            **{k: v for k, v in validated_data.items() if k != 'email' and k != 'username'},
        )
        return user

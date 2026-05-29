from django.contrib.auth import get_user_model
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.backends import ModelBackend

User = get_user_model()


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Custom serializer that treats 'username' field as 'email'.
    """
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        # Remove the default 'username' field and add our custom one
        self.fields['username'] = serializers.CharField()
        # Remove 'email' field if it exists from parent
        if 'email' in self.fields:
            del self.fields['email']

    def validate(self, attrs):
        # Get username (which is really an email) from the input
        username = attrs.pop('username', None)
        
        if not username:
            raise serializers.ValidationError({'username': ['This field is required.']})
        
        # Try to authenticate using email (our USERNAME_FIELD)
        password = attrs.get('password', None)
        if not password:
            raise serializers.ValidationError({'password': ['This field is required.']})
        
        # Custom authentication using email directly
        try:
            user = User.objects.get(email=username)
        except User.DoesNotExist:
            raise serializers.ValidationError({'non_field_errors': ['Invalid credentials']})
        
        if not user.check_password(password):
            raise serializers.ValidationError({'non_field_errors': ['Invalid credentials']})
        
        if not user.is_active:
            raise serializers.ValidationError({'non_field_errors': ['User account is disabled.']})
        
        # Generate tokens
        refresh = self.get_token(user)
        
        return {
            'refresh': str(refresh),
            'access': str(refresh.access_token),
        }


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

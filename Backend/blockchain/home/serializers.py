from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError as DjangoValidationError
from django.db import transaction
from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import Account
from user.models import User as StoreUser


class AccountTokenSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = 'admin' if user.is_superuser or user.is_admin or user.role == 'admin' else 'customer'
        return token

    def validate(self, attrs):
        data = super().validate(attrs)
        try:
            data['user_id'] = StoreUser.objects.get(email__iexact=self.user.email).pk
        except StoreUser.DoesNotExist:
            data['user_id'] = None
        data['username'] = self.user.username
        data['role'] = 'admin' if self.user.is_superuser or self.user.is_admin or self.user.role == 'admin' else 'customer'
        data['email'] = self.user.email
        return data


class RegistrationSerializer(serializers.Serializer):
    email = serializers.EmailField()
    username = serializers.CharField(max_length=30)
    password = serializers.CharField(write_only=True, min_length=8, trim_whitespace=False)
    first_name = serializers.CharField(max_length=30)
    last_name = serializers.CharField(max_length=30)
    mobile_no = serializers.CharField(max_length=15)

    def validate_email(self, value):
        if Account.objects.filter(email__iexact=value).exists() or StoreUser.objects.filter(email__iexact=value).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return value

    def validate_username(self, value):
        if Account.objects.filter(username__iexact=value).exists() or StoreUser.objects.filter(username__iexact=value).exists():
            raise serializers.ValidationError('This username is already taken.')
        return value

    def validate_mobile_no(self, value):
        if not value.isdigit():
            raise serializers.ValidationError('Enter a phone number using digits only.')
        return value

    def validate(self, attrs):
        try:
            validate_password(attrs['password'])
        except DjangoValidationError as exc:
            raise serializers.ValidationError({'password': list(exc.messages)})
        return attrs

    @transaction.atomic
    def create(self, validated_data):
        account = Account.objects.create_user(
            email=validated_data['email'], username=validated_data['username'],
            password=validated_data['password'])
        store_user = StoreUser.objects.create(
            email=account.email, username=account.username,
            first_name=validated_data['first_name'], last_name=validated_data['last_name'],
            mobile_no=validated_data['mobile_no'], password='')
        return account, store_user

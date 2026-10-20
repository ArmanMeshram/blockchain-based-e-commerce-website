from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from .serializers import AccountTokenSerializer, RegistrationSerializer


class LoginView(TokenObtainPairView):
    serializer_class = AccountTokenSerializer


class RegisterView(generics.GenericAPIView):
    serializer_class = RegistrationSerializer
    permission_classes = [permissions.AllowAny]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        account, store_user = serializer.save()
        refresh = AccountTokenSerializer.get_token(account)
        data = {
            'refresh': str(refresh), 'access': str(refresh.access_token),
            'user_id': store_user.pk, 'username': account.username, 'email': account.email,
            'role': 'admin' if account.role == 'admin' else 'customer',
        }
        return Response(data, status=status.HTTP_201_CREATED)

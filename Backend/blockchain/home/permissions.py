from rest_framework.permissions import BasePermission
from user.models import User as StoreUser


class RolePermission(BasePermission):
    allowed_roles = ()
    owner_prefixes = ('api/cart/', 'api/order/', 'api/user/', 'api/nft/', 'api/token/')

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            return False
        role = 'admin' if user.is_superuser or user.is_admin else getattr(user, 'role', 'customer')
        if role not in self.allowed_roles:
            return False
        route = getattr(getattr(request, 'resolver_match', None), 'route', '') or ''
        if role == 'customer' and route.startswith(self.owner_prefixes):
            try:
                profile = StoreUser.objects.get(email__iexact=user.email)
            except StoreUser.DoesNotExist:
                return False
            target_id = view.kwargs.get('uid', view.kwargs.get('id'))
            if target_id is not None and str(target_id) != str(profile.pk):
                return False
        return True


class IsCustomer(RolePermission):
    allowed_roles = ('customer', 'admin')


class IsAdmin(RolePermission):
    allowed_roles = ('admin',)

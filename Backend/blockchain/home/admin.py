from django.contrib import admin
from home.models import Account


@admin.register(Account)
class AccountAdmin(admin.ModelAdmin):
    list_display = ('email', 'username', 'role', 'is_active', 'is_staff', 'date_joined')
    list_filter = ('role', 'is_active', 'is_staff')
    search_fields = ('email', 'username')
    ordering = ('email',)
    readonly_fields = ('id', 'date_joined', 'last_login', 'password')
    fields = ('email', 'username', 'role', 'is_active', 'is_staff', 'is_admin', 'is_superuser', 'password', 'date_joined', 'last_login')

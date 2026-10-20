from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.db import models


class MyAccountManager(BaseUserManager):
    def create_user(self, email, username, password=None):
        if not email:
            raise ValueError('Users must have an email address')
        if not username:
            raise ValueError('Users must have a username')
        user = self.model(email=self.normalize_email(email), username=username, role='customer')
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password):
        user = self.create_user(email=email, username=username, password=password)
        user.role = 'admin'
        user.is_admin = True
        user.is_staff = True
        user.is_superuser = True
        user.save(using=self._db)
        # The storefront uses a separate profile model for its foreign keys.
        from user.models import User as StoreUser
        StoreUser.objects.get_or_create(
            email=user.email,
            defaults={'username': user.username, 'first_name': '', 'last_name': '', 'mobile_no': ''},
        )
        return user


class Account(AbstractBaseUser):
    ROLE_CHOICES = (('customer', 'Customer'), ('admin', 'Admin'))
    email = models.EmailField(verbose_name='email', max_length=60, unique=True)
    username = models.CharField(max_length=30, unique=True)
    date_joined = models.DateTimeField(verbose_name='date joined', auto_now_add=True)
    last_login = models.DateTimeField(verbose_name='last login', auto_now=True)
    role = models.CharField(max_length=12, choices=ROLE_CHOICES, default='customer')
    is_admin = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']
    objects = MyAccountManager()

    def has_perm(self, perm, obj=None):
        return self.is_active and (self.role == 'admin' or self.is_admin or self.is_superuser)

    def has_module_perms(self, app_label):
        return self.has_perm(None)

    def save(self, *args, **kwargs):
        if self.role == 'admin':
            self.is_admin = True
            self.is_staff = True
        elif not self.is_superuser:
            self.is_admin = False
            self.is_staff = False
        super().save(*args, **kwargs)

    def __str__(self):
        return self.username

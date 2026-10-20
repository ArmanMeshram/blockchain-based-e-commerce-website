from rest_framework.test import APITestCase
from rest_framework import status
from home.models import Account
from user.models import User as StoreUser
from user.models import Product


class AuthenticationTests(APITestCase):
    def setUp(self):
        self.registration = {
            'email': 'buyer@example.com',
            'username': 'buyer-one',
            'password': 'Secure-Fresh-2026!x',
            'first_name': 'Buyer',
            'last_name': 'One',
            'mobile_no': '919876543210',
        }

    def test_register_creates_hashed_account_and_returns_jwt(self):
        response = self.client.post('/register/', self.registration, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        account = Account.objects.get(email='buyer@example.com')
        store_user = StoreUser.objects.get(email='buyer@example.com')
        self.assertTrue(account.check_password(self.registration['password']))
        self.assertNotEqual(store_user.password, self.registration['password'])
        self.assertEqual(response.data['user_id'], store_user.pk)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)
        self.assertEqual(response.data['role'], 'customer')

    def test_duplicate_registration_is_rejected(self):
        first = self.client.post('/register/', dict(self.registration, role='admin'), format='json')
        self.assertEqual(first.status_code, status.HTTP_201_CREATED, first.data)
        duplicate = dict(self.registration, username='buyer-two')
        response = self.client.post('/register/', duplicate, format='json')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_login_returns_jwt_and_private_cart_requires_authentication(self):
        self.client.post('/register/', self.registration, format='json')
        response = self.client.post('/login/', {
            'email': self.registration['email'], 'password': self.registration['password'],
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK, response.data)
        self.assertEqual(response.data['user_id'], StoreUser.objects.get(email=self.registration['email']).pk)
        private_response = self.client.get('/api/cart/1/')
        self.assertEqual(private_response.status_code, status.HTTP_401_UNAUTHORIZED)


    def test_customer_cannot_manage_products_even_if_role_is_requested_at_signup(self):
        response = self.client.post('/register/', dict(self.registration, role='admin'), format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED, response.data)
        account = Account.objects.get(email=self.registration['email'])
        self.assertEqual(account.role, 'customer')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
        profile_id = StoreUser.objects.get(email=self.registration['email']).pk
        forbidden = self.client.post('/api/product/{}/add/'.format(profile_id), {
            'name': 'Customer product', 'price': 1.0,
        }, format='json')
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

    def test_customer_cannot_read_another_customers_cart(self):
        response = self.client.post('/register/', self.registration, format='json')
        other = StoreUser.objects.create(email='other@example.com', username='other', mobile_no='123', password='')
        self.client.credentials(HTTP_AUTHORIZATION='Bearer ' + response.data['access'])
        forbidden = self.client.get('/api/cart/{}/'.format(other.pk))
        self.assertEqual(forbidden.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_manage_products_and_jwt_identifies_role(self):
        admin_user = Account.objects.create_superuser('admin@example.com', 'site-admin', 'Secure-Admin-2026!')
        self.client.force_authenticate(user=admin_user)
        profile = StoreUser.objects.get(email='admin@example.com')
        created = self.client.post('/api/product/{}/add/'.format(profile.pk), {
            'name': 'Admin product', 'price': 19.5,
        }, format='json')
        self.assertEqual(created.status_code, status.HTTP_201_CREATED, created.data)
        self.client.force_authenticate(user=None)
        login = self.client.post('/login/', {'email': 'admin@example.com', 'password': 'Secure-Admin-2026!'}, format='json')
        self.assertEqual(login.status_code, status.HTTP_200_OK, login.data)
        self.assertEqual(login.data['role'], 'admin')

    def test_product_catalog_remains_public(self):
        response = self.client.get('/api/product/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

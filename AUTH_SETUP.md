# Authentication setup

The marketplace now uses the existing Django custom account model with JWT access/refresh tokens.

## Start the app

1. In `Backend/blockchain`, install `requirements.txt`, set a long random `DJANGO_SECRET_KEY` in the environment, then run `python manage.py migrate` and `python manage.py runserver`.
2. In `Frontend`, install dependencies with `npm install`, then run `npm start`. Set `REACT_APP_API_URL` if the API is not at `http://localhost:8000`.
3. Register at `/register` or sign in at `/login`.

## Authentication API

- `POST /register/` — accepts `email`, `username`, `password`, `first_name`, `last_name`, and `mobile_no`; creates an auth account and linked marketplace profile, then returns JWTs and `user_id`.
- `POST /login/` — accepts `email` and `password`; returns JWTs and the marketplace `user_id`.
- `POST /refresh/` — accepts a refresh token and returns a new access token.

Private API endpoints require `Authorization: Bearer <access-token>`. Product catalog listing and detail remain public. Phone numbers are stored as strings to preserve country codes and leading zeroes; migration `user.0002_mobile_no_charfield` applies the schema update.

For production, use HTTPS, a unique secret key from the environment, and configure Django's `ALLOWED_HOSTS` and CORS origins for the deployed domains.

## Roles and permissions

- **Customer** is the default role for every public registration. A submitted `role` value is ignored; customers can use their own cart, orders, profile and collectibles.
- **Admin** can manage (add, edit, delete) products. Admin role changes are controlled through Django admin; backend API permissions enforce the same policy, and customers cannot access another customer's user-scoped records by changing URL IDs.
- Bootstrap the first administrator with `python manage.py createsuperuser` after migrations. This creates a linked storefront profile. Sign in at `/admin/`, then change a trusted account's role to `Admin`; saving the role also grants Django staff access. A superuser can administer all accounts.

The JWT response includes a `role` field for the frontend, while API permissions check the current server-side account role on every request.

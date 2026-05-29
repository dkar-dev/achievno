import os
from pathlib import Path

import dj_database_url


BASE_DIR = Path(__file__).resolve().parent.parent


def env_bool(name: str, default: bool = False) -> bool:
    value = os.environ.get(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def env_csv(name: str, default: list[str] | None = None) -> list[str]:
    value = os.environ.get(name)
    if value is None:
        return list(default or [])
    return [item.strip() for item in value.split(",") if item.strip()]


def env_int(name: str, default: int) -> int:
    value = os.environ.get(name)
    if value is None:
        return default
    return int(value)


SECRET_KEY = os.environ.get(
    "DJANGO_SECRET_KEY",
    "django-insecure-achievno-local-a0-development-only",
)
DEBUG = env_bool("DJANGO_DEBUG", default=False)
ALLOWED_HOSTS = env_csv(
    "DJANGO_ALLOWED_HOSTS",
    default=["localhost", "127.0.0.1", "testserver"],
)

INSTALLED_APPS = [
    "corsheaders",
    "rest_framework",
    "apps.accounts",
    "apps.profiles",
    "apps.friends",
    "apps.groups",
    "apps.achievements",
    "apps.challenges",
    "apps.notifications",
    "apps.platform",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.middleware.common.CommonMiddleware",
]

ROOT_URLCONF = "config.urls"
ASGI_APPLICATION = "config.asgi.application"
WSGI_APPLICATION = "config.wsgi.application"
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {
        "default": dj_database_url.parse(
            DATABASE_URL,
            conn_max_age=0,
            conn_health_checks=False,
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "a0_check.sqlite3",
        }
    }

CORS_ALLOWED_ORIGINS = env_csv(
    "CORS_ALLOWED_ORIGINS",
    default=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
)
CORS_ALLOW_CREDENTIALS = True

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "apps.accounts.infrastructure.authentication.CookieJWTAuthentication",
    ],
    "DEFAULT_PERMISSION_CLASSES": [],
    "UNAUTHENTICATED_USER": None,
}

ACHIEVNO_ACCESS_TOKEN_SECRET = os.environ.get("ACCESS_TOKEN_SECRET", SECRET_KEY)
ACHIEVNO_ACCESS_TOKEN_TTL_SECONDS = env_int("ACHIEVNO_ACCESS_TOKEN_TTL_SECONDS", 15 * 60)
ACHIEVNO_REFRESH_TOKEN_TTL_SECONDS = env_int("ACHIEVNO_REFRESH_TOKEN_TTL_SECONDS", 30 * 24 * 60 * 60)
ACHIEVNO_ACCESS_COOKIE_NAME = "achievno_access"
ACHIEVNO_REFRESH_COOKIE_NAME = "achievno_refresh"
ACHIEVNO_AUTH_COOKIE_SECURE = env_bool("ACHIEVNO_AUTH_COOKIE_SECURE", default=False)
ACHIEVNO_AUTH_COOKIE_SAMESITE = os.environ.get("ACHIEVNO_AUTH_COOKIE_SAMESITE", "Lax")
ACHIEVNO_AUTH_COOKIE_PATH = "/"
ACHIEVNO_RETURN_DEV_VERIFICATION_TOKEN = DEBUG or env_bool(
    "ACHIEVNO_RETURN_DEV_VERIFICATION_TOKEN",
    default=False,
)

ACHIEVNO_PUBLIC_APP_URL = os.environ.get("ACHIEVNO_PUBLIC_APP_URL", "http://127.0.0.1:3000")
ACHIEVNO_EMAIL_VERIFICATION_PATH = os.environ.get(
    "ACHIEVNO_EMAIL_VERIFICATION_PATH",
    "/auth/verify-email",
)
ACHIEVNO_SEND_VERIFICATION_EMAIL = env_bool("ACHIEVNO_SEND_VERIFICATION_EMAIL", default=False)

EMAIL_BACKEND = os.environ.get(
    "EMAIL_BACKEND",
    "django.core.mail.backends.smtp.EmailBackend",
)
EMAIL_HOST = os.environ.get("EMAIL_HOST", "")
EMAIL_PORT = env_int("EMAIL_PORT", 587)
EMAIL_HOST_USER = os.environ.get("EMAIL_HOST_USER", "")
EMAIL_HOST_PASSWORD = os.environ.get("EMAIL_HOST_PASSWORD", "")
EMAIL_USE_TLS = env_bool("EMAIL_USE_TLS", default=True)
EMAIL_USE_SSL = env_bool("EMAIL_USE_SSL", default=False)
EMAIL_TIMEOUT = env_int("EMAIL_TIMEOUT", 10)
DEFAULT_FROM_EMAIL = os.environ.get("DEFAULT_FROM_EMAIL", EMAIL_HOST_USER)
SERVER_EMAIL = DEFAULT_FROM_EMAIL

USE_TZ = True
TIME_ZONE = "UTC"

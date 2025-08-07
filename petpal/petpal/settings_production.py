"""
Production settings for petpal project deployed on Railway.
"""

import os
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# ========== Paths ========== #
BASE_DIR = Path(__file__).resolve().parent.parent

# ========== Security ========== #
SECRET_KEY = os.getenv('DJANGO_SECRET_KEY', 'django-insecure-change-this-in-production')
DEBUG = os.getenv('DEBUG', 'False').lower() == 'true'

# Railway provides RAILWAY_STATIC_URL and RAILWAY_PUBLIC_DOMAIN
ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '.railway.app',
    '.vercel.app',
]

# Add any custom domains
if os.getenv('RAILWAY_PUBLIC_DOMAIN'):
    ALLOWED_HOSTS.append(os.getenv('RAILWAY_PUBLIC_DOMAIN'))

# ========== URLs Configuration ========== #
FRONTEND_URL = os.getenv('FRONTEND_URL', 'https://localhost:3000')
BACKEND_URL = os.getenv('BACKEND_URL', 'https://localhost:8000')

# ========== Applications ========== #
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes", 
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
    "rest_framework",
    "api",
    "corsheaders",
    "social_django",
]

# ========== Middleware ========== #
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# ========== CORS Configuration ========== #
CORS_ALLOW_CREDENTIALS = True
CORS_ALLOWED_ORIGINS = [
    FRONTEND_URL,
    "https://localhost:3000",
    "http://localhost:3000",
]

# Add any additional frontend domains
if os.getenv('ADDITIONAL_FRONTEND_URLS'):
    additional_urls = os.getenv('ADDITIONAL_FRONTEND_URLS').split(',')
    CORS_ALLOWED_ORIGINS.extend([url.strip() for url in additional_urls])

CSRF_TRUSTED_ORIGINS = CORS_ALLOWED_ORIGINS.copy()

# ========== URL Configuration ========== #
ROOT_URLCONF = "petpal.urls"

# ========== Templates ========== #
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# ========== WSGI Application ========== #
WSGI_APPLICATION = "petpal.wsgi.application"

# ========== Database Configuration ========== #
if os.getenv('DATABASE_URL'):
    DATABASES = {
        'default': dj_database_url.parse(os.getenv('DATABASE_URL'))
    }
else:
    # Fallback to SQLite for development
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }

# ========== Password Validation ========== #
AUTH_PASSWORD_VALIDATORS = [
    {"NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator"},
    {"NAME": "django.contrib.auth.password_validation.MinimumLengthValidator"},
    {"NAME": "django.contrib.auth.password_validation.CommonPasswordValidator"},
    {"NAME": "django.contrib.auth.password_validation.NumericPasswordValidator"},
]

# ========== Internationalization ========== #
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# ========== Static and Media Files ========== #
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# Static files handling with WhiteNoise
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'

# ========== Default Primary Key ========== #
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# ========== Authentication Backends ========== #
AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    "django.contrib.auth.backends.ModelBackend",
)

# ========== Social Auth Configuration ========== #
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.getenv('GOOGLE_OAUTH2_CLIENT_ID')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('GOOGLE_OAUTH2_CLIENT_SECRET')
SOCIAL_AUTH_GOOGLE_OAUTH2_AUTH_EXTRA_ARGUMENTS = {"prompt": "select_account"}
SOCIAL_AUTH_GOOGLE_OAUTH2_EXTRA_DATA = ["fullname", "picture", "email"]

# ========== API Keys ========== #
GOOGLE_MAPS_API_KEY = os.getenv('GOOGLE_MAPS_API_KEY', '')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')

# ========== Login/Redirect Configuration ========== #
LOGIN_URL = f"{FRONTEND_URL}/Register"
SOCIAL_AUTH_GOOGLE_OAUTH2_REDIRECT_URI = f"{BACKEND_URL}/oauth/complete/google-oauth2/"
LOGIN_REDIRECT_URL = FRONTEND_URL

# ========== Allowed Path Suffixes ========== #
ALLOWED_PATH_SUFFIXES = [
    "",
    "ProfileSignUp", 
    "Matching",
    "Dashboard",
    "Profile",
]

# ========== Security Settings for Production ========== #
if not DEBUG:
    SECURE_BROWSER_XSS_FILTER = True
    SECURE_CONTENT_TYPE_NOSNIFF = True
    X_FRAME_OPTIONS = 'DENY'
    SECURE_HSTS_SECONDS = 86400
    SECURE_HSTS_INCLUDE_SUBDOMAINS = True
    SECURE_HSTS_PRELOAD = True
    
    # Only if using HTTPS
    if BACKEND_URL.startswith('https://'):
        SECURE_SSL_REDIRECT = True
        SESSION_COOKIE_SECURE = True
        CSRF_COOKIE_SECURE = True

# ========== Logging ========== #
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': os.getenv('DJANGO_LOG_LEVEL', 'INFO'),
            'propagate': False,
        },
    },
}
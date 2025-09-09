from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from django.urls import path, include
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'pets', views.PetViewSet, basename='pets')

urlpatterns = [
    path('api/', include(router.urls)),
    path('api/csrf/', views.get_csrf_token, name='csrf_token'),
    path('auth/redirect/', views.oauth_redirect, name='oauth_redirect'),
]
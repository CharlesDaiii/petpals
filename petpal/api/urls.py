from django.conf import settings
from django.conf.urls.static import static
from django.shortcuts import render
from django.urls import path, include
from django.contrib.auth.views import LogoutView
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'pets', views.PetViewSet)


urlpatterns = [
    path('', views.home, name='home'),
    path('api/status/', views.api_status, name='api_status'),
    path('api/', include(router.urls)),
    path('login/', views.login, name='login'),
    path('logout/', LogoutView.as_view(next_page='/'), name='logout'),
    path('pets/add/', views.PetFormView.as_view(), name='pet-add'),
    path('pets/success/', lambda request: render(request, 'api/success.html'), name='pet-success'),
    path('api/logout/', views.api_logout, name='logout'),
    path('api/csrf/', views.get_csrf_token, name='csrf_token'),
    path('auth/redirect/', views.oauth_redirect, name='oauth_redirect'),
    path('ProfileSignUp/', views.profile_signup_redirect, name='profileSignUp'),
    path('api/ProfileSignUp/', views.profile_setup, name='profile_setup'),
    path('api/matching/', views.matching, name='matching'),
    path('api/match-pet/', views.match_pet, name='match_pet'),
    path('api/upload-photos/', views.upload_photos, name='upload-photos'),  
    path('api/user-pet/', views.get_user_pet, name='get_user_pet'),
    path('api/check-pet-exists/', views.check_pet_exists, name='check-pet-exists'),
    path('api/follow-pet/<int:pet_id>/', views.follow_pet, name='follow-pet'),
    path('api/following/', views.get_following, name='get-following'),
    path('api/followers/', views.get_followers, name='get-followers'),
    path('api/unfollow-pet/<int:pet_id>/', views.unfollow_pet, name='unfollow-pet'),
    path('api/wag-back/<int:follower_id>/', views.wag_back, name='wag-back'),
    path('api/update-pet/', views.update_pet, name='update-pet'),
    path('api/user-pet/<int:id>/', views.get_other_pet, name='get-other-pet'),

    path('api/u/<int:id>/', views.get_pet_by_id, name='get-pet-by-id'),
]

if settings.DEBUG:  
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)

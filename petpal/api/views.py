from django.conf import settings
from django.core.files.storage import default_storage
from django.contrib.auth import login, logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.http import require_GET
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.middleware.csrf import get_token

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Pet
from .forms import PetForm, RegisterForm
from .serializers import PetSerializer
from .filters import process_target_pet
import googlemaps
from rest_framework.viewsets import ModelViewSet
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Pet
from rest_framework import viewsets
from rest_framework.decorators import action

import cloudinary.uploader

# --- authentication methods ---
# Custom login required decorator, return json response
def custom_login_required(view_func):
    def wrapper(request, *args, **kwargs):
        next_url = request.GET.get('next', '')
        next_url = validate_url(next_url)
        if not request.user.is_authenticated:
            return JsonResponse({"is_authenticated": False}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper

@require_GET
def oauth_redirect(request):
    return JsonResponse({
            "is_authenticated": request.user.is_authenticated,
            "username": request.user.username if request.user.is_authenticated else "",
        }, status=200)


@api_view(['GET'])
@ensure_csrf_cookie
def get_csrf_token(request):
    """Get CSRF token for frontend"""
    return Response({
        'csrfToken': get_token(request)
    })

class PetViewSet(viewsets.ViewSet):
    @action(detail=False, methods=["get"], url_path="check-pet-exists")
    def check_pet_exists(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({"is_authenticated": False, "has_pet": False}, status=200)

            pet_exists = Pet.objects.filter(owner=request.user).exists()
            return Response({"is_authenticated": True, "has_pet": pet_exists}, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=["post"], url_path="logout")
    def logout(self, request):
        if request.user.is_authenticated:
            logout(request)
            return Response({"message": "Successfully logged out"}, status=200)
        return Response({"message": "Already logged out"}, status=200)


    @action(detail=False, methods=["post"], url_path="ProfileSignUp")
    def ProfileSignUp(self, request):
        try:
            if not request.user.is_authenticated:
                return Response({'error': 'User not authenticated'}, status=401)
            
            pet_data = request.data
            pet = Pet.create_pet(user=request.user, pet_data=pet_data)

            return Response({'message': 'Profile created successfully'}, status=201)
        except ValueError as e:
            return Response({'error': str(e)}, status=400)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=["get"], url_path="match-pet")
    def match_pet(self, request):
        try:
            user_pet = Pet.objects.get(owner=request.user)
            user_data = {
                'username': request.user.username,
            }
            pet_data = user_pet.get_data(as_list=False)

            return Response({
                'user': user_data,
                'pet': pet_data
            })
        
        except Pet.DoesNotExist:
            return Response({'error': 'Pet not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=500)

    @action(detail=False, methods=["get"], url_path="user-pet")
    def get_user_pet(self, request):
        try:
            user = request.user
            pet = Pet.objects.filter(owner=user).first()
            if not pet:
                return Response({"error": "No pet found for the current user."}, status=404)
            pet_data = pet.get_data()

            return Response(pet_data, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    @action(detail=False, methods=["get"], url_path="matching")
    def matching(self, request):
        try:
            user_pet = Pet.objects.get(owner=request.user)
            
            if not user_pet.location:
                print("No pet location found for user")
                return Response({'error': 'User pet location not found'}, status=400)

            result = process_target_pet(user_pet.id, request.user.id)
            return JsonResponse({'results': result}, status=200)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    @action(detail=False, methods=["post"], url_path="upload-photos")
    def upload_photos(self, request):
        try:
            photo_urls = []
            
            for photo_file in request.FILES.getlist('photos'):
                upload_result = cloudinary.uploader.upload(
                    photo_file,
                    folder="pet_photos/",
                    transformation=[
                        {'width': 800, 'height': 800, 'crop': 'limit'},
                        {'quality': 'auto', 'fetch_format': 'auto'},
                    ]
                )
                photo_urls.append(upload_result['secure_url'])
            
            return JsonResponse({'photos': photo_urls})
            
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)

    @action(detail=True, methods=["post"], url_path="follow-pet")
    def follow_pet(self, request, pk=None):
        pet_id = pk
        try:
            user_pet = Pet.objects.get(owner=request.user)
            print(f"Found user's pet: {user_pet.name}")
            
            user_pet.wag(pet_id)
            
            return Response({
                'message': 'Successfully followed pet',
                'isFollowing': True
            }, status=200)
            
        except Pet.DoesNotExist as e:
            print(f"Pet not found error: {str(e)}")
            return Response({'error': 'Pet not found'}, status=404)
        except ValueError as e:
            print(f"Value error: {str(e)}")
            return Response({'error': str(e)}, status=404)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({'error': str(e)}, status=400)

    @action(detail=False, methods=["get"], url_path="following")
    def get_following(self, request):
        pet_id = request.query_params.get('id', None)
        try:
            user_pet = Pet.objects.get(owner=request.user)

            # get other pet's following count
            if pet_id and pet_id != str(user_pet.id):
                user_pet = Pet.objects.get(id=pet_id)
                following_count = user_pet.following.count()
                return Response({'following_count': following_count}, status=200)

            # get current user's following
            following_pets = user_pet.following.all()
            following_data = []

            for followed_pet in following_pets:
                try:
                    followed_pet = Pet.objects.get(id=followed_pet.id)
                    following_data.append({
                        'id': followed_pet.id,
                        'name': followed_pet.name,
                        'photo': followed_pet.photos[0] if followed_pet.photos else None,
                        'isFriend': user_pet.is_friend(followed_pet.id),
                    })
                except Pet.DoesNotExist:
                    continue
                    
            return Response({'following': following_data}, status=200)
        except Pet.DoesNotExist:
            return Response({'error': 'Pet not found'}, status=404)

    @action(detail=False, methods=["get"], url_path="followers")
    def get_followers(self, request):
        pet_id = request.query_params.get('id', None)
        print(f"Received get followers request for pet {pet_id}")
        try:
            user_pet = Pet.objects.get(owner=request.user)

            # get other pet's followers count
            if pet_id and pet_id != str(user_pet.id):
                user_pet = Pet.objects.get(id=pet_id)
                followers_count = user_pet.followers.count()
                return Response({'followers_count': followers_count}, status=200)
            
            # get current user's followers
            followers_data = []
            for follower_pet in user_pet.followers.all():
                try:
                    followers_data.append({
                        'id': follower_pet.id,
                        'name': follower_pet.name,
                        'isFriend': user_pet.is_friend(follower_pet.id),
                        'photo': follower_pet.photos[0] if follower_pet.photos else None
                    })
                except Pet.DoesNotExist:
                    continue
                    
            return Response({'followers': followers_data}, status=200)
        except Pet.DoesNotExist:
            return Response({'error': 'Pet not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=["post"], url_path="unfollow-pet")
    def unfollow_pet(self, request, pk=None):
        pet_id = pk
        print(f"Received unfollow request for pet {pet_id}")
        print(f"User authenticated: {request.user.is_authenticated}")
        print(f"User: {request.user.username}")
        
        try:        
            user_pet = Pet.objects.get(owner=request.user)
            print(f"Found user's pet: {user_pet.name}")
            
            user_pet.unwag(pet_id)
            
            return Response({
                'message': 'Successfully unfollowed pet',
                'isFollowing': False
            }, status=200)
            
        except Pet.DoesNotExist as e:
            print(f"Pet not found error: {str(e)}")
            return Response({'error': 'Pet not found'}, status=404)
        except ValueError as e:
            print(f"Error in unwag method: {str(e)}")
            return Response({'error': str(e)}, status=404)
        except Exception as e:
            print(f"Unexpected error: {str(e)}")
            return Response({'error': str(e)}, status=400)

    @action(detail=True, methods=["post"], url_path="wag-back")
    def wag_back(self, request, pk=None):
        follower_id = pk
        try:
            user_pet = Pet.objects.get(owner=request.user)
            
            user_pet.wag(follower_id)
            
            return Response({
                'message': 'Successfully wagged back',
                'isFollowing': True
            }, status=200)
        
        except Pet.DoesNotExist:
            return Response({'error': 'Pet not found'}, status=404)
        except ValueError as e:
            return Response({'error': str(e)}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        

    @action(detail=False, methods=["post"], url_path="update-pet")
    def update_pet(self, request):
        try:
            pet_data = request.data
            pet = Pet.objects.get(owner=request.user) 
            pet.update_pet(pet_data)

            return Response({'message': 'Pet profile updated successfully'}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
        except Pet.DoesNotExist:
            return Response({'error': 'Pet not found'}, status=404)
        except Exception as e:
            return Response({'error': str(e)}, status=400)


def validate_url(next_url):
    if not (next_url and next_url in settings.ALLOWED_PATH_SUFFIXES):
        next_url = ''
    return next_url

def calculate_distance(start, end):
    gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
    distance = gmaps.distance_matrix(start, end)
    return distance['rows'][0]['elements'][0]['distance']['value'] / 1609.34 # convert to miles
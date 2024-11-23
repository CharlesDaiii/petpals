from datetime import datetime
from urllib.parse import urlencode
import json

from django.conf import settings
from django.core.files.storage import default_storage
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import AuthenticationForm
from django.contrib.auth.models import User
from django.http import HttpResponse, JsonResponse, HttpResponseRedirect
from django.shortcuts import render, redirect
from django.urls import reverse
from django.utils.decorators import method_decorator
from django.views import View
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

from rest_framework import viewsets, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Pet, UserProfile
from .forms import PetForm, RegisterForm
from .serializers import PetSerializer
from .filters import process_target_pet
import googlemaps
from rest_framework.viewsets import ModelViewSet

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
@custom_login_required
def oauth_redirect(request):
    return JsonResponse({"is_authenticated": request.user.is_authenticated,
                         "username": request.user.username,
                         }, status=200)

# Custom redirect
@login_required
def profileSignUp(request):
    return redirect('http://localhost:3000/ProfileSignUp')

@login_required
def api_logout(request):
    if request.method == 'POST':
        logout(request)
        return JsonResponse({"message": "Successfully logged out"}, status=200)
    return JsonResponse({"error": "Invalid request method"}, status=400)

def home(request):
    return render(request, 'api/home.html')

def login(request):
    return render(request, 'api/login.html')

def home(request):
    return render(request, 'api/home.html')

class PetViewSet(ModelViewSet):
    queryset = Pet.objects.all()
    serializer_class = PetSerializer
    permission_classes = [IsAuthenticated]  

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)  


class RegisterView(View):
    def get(self, request):
        form = RegisterForm()
        return render(request, 'api/register.html', {'form': form})

    def post(self, request):
        form = RegisterForm(request.POST)
        if form.is_valid():
            user = form.save()
            login(request, user)
            return redirect('home')
        return render(request, 'api/register.html', {'form': form})

class LoginView(View):
    def get(self, request):
        form = AuthenticationForm()
        return render(request, 'api/login.html', {'form': form})

    def post(self, request):
        form = AuthenticationForm(data=request.POST)
        if form.is_valid():
            user = form.get_user()
            login(request, user)
            return redirect('home')
        return render(request, 'api/login.html', {'form': form})

@method_decorator(login_required, name='dispatch')
class PetFormView(View):
    def get(self, request):
        form = PetForm()
        return render(request, 'api/pet_form.html', {'form': form})
    
    def post(self, request):
        form = PetForm(request.POST)
        if form.is_valid():
            form.save()  
            return redirect('pet-success')  
        return render(request, 'api/pet_form.html', {'form': form})

@api_view(['POST'])
@permission_classes([IsAuthenticated])
@login_required
def profile_setup(request):
    try:
        user_profile, created = UserProfile.objects.get_or_create(user=request.user)
        
        pet_data = request.data
        pet = Pet.objects.create(
            owner=request.user,
            name=pet_data['name'],
            sex=pet_data['sex'],
            preferred_time=pet_data['preferred_time'],
            breed=pet_data['breed'],
            birth_date=pet_data['birth_date'],
            location=pet_data['location'],
            weight=float(pet_data['weight']),
            health_states=pet_data.get('health_states', ''),
            characters=pet_data.get('characters', ''),
            red_flags=pet_data.get('red_flags', ''),
            photos=pet_data.get('photos', [])
        )
        
        user_profile.pet = pet
        user_profile.save()
        
        return Response({'message': 'Profile created successfully'}, status=201)
    except Exception as e:
        return Response({'error': str(e)}, status=400)


# helper function to check path suffix:
def validate_url(next_url):
    if not (next_url and next_url in settings.ALLOWED_PATH_SUFFIXES):
        next_url = ''
    return next_url

def calculate_distance(start, end):
    gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
    distance = gmaps.distance_matrix(start, end)
    return distance['rows'][0]['elements'][0]['distance']['value'] / 1609.34 # convert to miles

@login_required
def matching_redirect(request):
    return redirect('http://localhost:3000/Matching')

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def matching(request):
    try:
        user_profile = UserProfile.objects.get(user=request.user)
        print(f"Found user profile for: {request.user.username}")
        
        if not user_profile.pet or not user_profile.pet.location:
            print("No pet or location found for user")
            return Response({'error': 'User pet location not found'}, status=400)

        result = process_target_pet(user_profile.pet.id, request.user.id)
        print(f"Matching result: {result}")
        return JsonResponse({'results': result}, status=200)
    except Exception as e:
        return JsonResponse({'error': str(e)}, status=400)

@permission_classes([IsAuthenticated])
class MatchingAPIView(APIView):
    def post(self, request):
        try:
            pet_id = request.data
            print(f"Processing target pet: {pet_id}")
            pet_info = Pet.objects.get(id=pet_id)
            print(f"pet info: {pet_info.__dict__}")
            result = process_target_pet(pet_id)
            return Response({'results': result}, status=200)
        except Exception as e:
            return Response({'error': str(e)}, status=400)
    
    def get(self, request):
        return Response({'error': 'Invalid request method'}, status=405)
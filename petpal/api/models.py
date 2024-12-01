from django.contrib.auth.models import User
from django.db import models
from django.core.exceptions import ValidationError

class Pet(models.Model):
    id = models.AutoField(primary_key=True)
    SEX_CHOICES = [
        ('Male', 'Male'),
        ('Female', 'Female'),
        ('Neutered', 'Neutered'),
    ]
    PREFERRED_TIME_CHOICES = [
        ('Morning', 'Morning (6-9 AM)'),
        ('Midday', 'Midday (11 AM - 2 PM)'),
        ('Afternoon', 'Afternoon (3-6 PM)'),
        ('Evening', 'Evening (6-9 PM)'),
    ]

    owner = models.OneToOneField(User, on_delete=models.CASCADE, related_name='pet')
    name = models.CharField(max_length=100)
    sex = models.CharField(max_length=10, choices=SEX_CHOICES)
    preferred_time = models.CharField(max_length=20, choices=PREFERRED_TIME_CHOICES)
    breed = models.CharField(max_length=100)
    birth_date = models.DateField()
    location = models.CharField(max_length=200)
    weight = models.FloatField()
    health_states = models.JSONField(default=list, blank=False, null=False)
    characters = models.JSONField(default=list, blank=False, null=False)
    red_flags = models.JSONField(default=list, blank=False, null=False) 
    photos = models.JSONField(default=list) 
    

    def clean(self):
        super().clean()
        if not isinstance(self.health_states, list) or not self.health_states:
            raise ValidationError({'health_states': 'Health states must be a non-empty list.'})
        if not isinstance(self.characters, list) or not self.characters:
            raise ValidationError({'characters': 'Characters must be a non-empty list.'})
        if not isinstance(self.red_flags, list) or not self.red_flags:
            raise ValidationError({'red_flags': 'Red flags must be a non-empty list.'})

    followers = models.ManyToManyField("self", symmetrical=False, blank=True, related_name="following")

    def __str__(self):
        return f"{self.name} ({self.breed})"
    
    def save(self, *args, **kwargs):
        if not self.photos:
            self.photos = ['/image/default.png']
        super().save(*args, **kwargs)

    @classmethod
    def create_pet(cls, user, pet_data):
        if not isinstance(pet_data.get('health_states'), list):
            raise ValueError('Health states must be a list.')
        if not isinstance(pet_data.get('characters'), list):
            raise ValueError('Characters must be a list.')
        if not isinstance(pet_data.get('red_flags'), list):
            raise ValueError('Red flags must be a list.')
        
        pet = cls.objects.create(
            owner=user,
            name=pet_data['name'],
            sex=pet_data['sex'],
            preferred_time=pet_data['preferred_time'],
            breed=pet_data['breed'],
            birth_date=pet_data['birth_date'],
            location=pet_data['location'],
            weight=float(pet_data['weight']),
            health_states=pet_data['health_states'],
            characters=pet_data['characters'],
            red_flags=pet_data['red_flags'],
            photos=pet_data.get('photos', []),
        )

        user_profile, created = UserProfile.objects.get_or_create(user=user)
        user_profile.pet = pet
        user_profile.save()

        return pet
    
    def update_pet(self, pet_data):
        if not isinstance(pet_data.get('health_states'), list):
            raise ValueError('Health states must be a list.')
        if not isinstance(pet_data.get('characters'), list):
            raise ValueError('Characters must be a list.')
        if not isinstance(pet_data.get('red_flags'), list):
            raise ValueError('Red flags must be a list.')
        
        self.name = pet_data['name']
        self.sex = pet_data['sex']
        self.preferred_time = pet_data['preferred_time']
        self.breed = pet_data['breed']
        self.birth_date = pet_data['birth_date']
        self.location = pet_data['location']
        self.weight = float(pet_data['weight'])
        self.health_states = pet_data['health_states']
        self.characters = pet_data['characters']
        self.red_flags = pet_data['red_flags']
        self.photos = pet_data.get('photos', [])

        self.save()
        return self


    def wag(self, pet_id):
        try:
            target_pet = Pet.objects.get(id=pet_id)
            if not self.following.filter(id=pet_id).exists():
                self.following.add(target_pet)
                target_pet.followers.add(self)
                print("Successfully wagged!")
        except Pet.DoesNotExist:
            raise ValueError(f"Pet with ID {pet_id} does not exist.")

    def unwag(self, pet_id):
        try:
            target_pet = Pet.objects.get(id=pet_id)
            if self.following.filter(id=pet_id).exists():
                self.following.remove(target_pet)
                target_pet.followers.remove(self)
                print("Successfully unwagged!")
        except Pet.DoesNotExist:
            raise ValueError(f"Pet with ID {pet_id} does not exist.")

    def is_friend(self, pet_id):
        try:
            pet = Pet.objects.get(id=pet_id)
            return (
                self.following.filter(id=pet_id).exists() and
                pet.following.filter(id=self.id).exists()
            )
        except Pet.DoesNotExist:
            return False

    def get_data(self, as_list=True):
        def to_list(value):
            if isinstance(value, list):
                return value
            return value.split(',')

        return {
            "name": self.name,
            "sex": self.sex,
            "preferred_time": self.preferred_time,
            "breed": self.breed,
            "birth_date": self.birth_date,
            "location": self.location,
            "weight": self.weight,
            "health_states": to_list(self.health_states) if as_list else self.health_states,
            "characters": to_list(self.characters) if as_list else self.characters,
            "red_flags": to_list(self.red_flags) if as_list else self.red_flags,
            "photos": self.photos,
        }
    
    @property
    def preferred_time_index(self):
        value_to_index = {value: index for index, (value, label) in enumerate(self.PREFERRED_TIME_CHOICES)}
        return value_to_index.get(self.preferred_time, None)


class UserProfile(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    def __str__(self):
        return self.user.username

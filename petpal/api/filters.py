import googlemaps
from .models import Pet
from openai import OpenAI
import regex
import json
from datetime import datetime
from django.conf import settings
from pathlib import Path
from django.core.serializers import serialize

# --- tools methods ---
def calculate_distance(start, end):
    gmaps = googlemaps.Client(key=settings.GOOGLE_MAPS_API_KEY)
    distance = gmaps.distance_matrix(start, end)
    return distance['rows'][0]['elements'][0]['distance']['value'] / 1609.34 # convert to miles

def calculate_distance_score(distance, max_distance=50, max_score=20):
    if distance > max_distance:
        return 0
    return round(max_score * (1 - distance / max_distance), 1)

def calculate_age(birth_date):
    today = datetime.now()
    years = today.year - birth_date.year
    months = today.month - birth_date.month
    days = today.day - birth_date.day

    if months < 0:
        years -= 1
        months += 12

    if days < 0:
        months -= 1

    if years == 0:
        return f"{months} month{'s' if months > 1 else ''}"

    return f"{years} year{'s' if years > 1 else ''}, {months} month{'s' if months > 1 else ''}"

# --- filters rules ---
def filter_by_time_range(pets, target_time):
    valid_choices = [choice[0] for choice in Pet._meta.get_field('preferred_time').choices]

    if target_time not in valid_choices:
        raise ValueError(f"Invalid time choice: {target_time}")
    
    target_index = valid_choices.index(target_time)

    filtered_pets = [
        pet_data for pet_data in pets
        if abs(valid_choices.index(pet_data['preferred_time']) - target_index) <= 1
    ]
    return filtered_pets


def filter_by_health_state(pets, target_states):
    required_states = ["rabies", "influenza", "dhlpp"]
    missing_states = [state for state in required_states if state not in target_states]
    filtered_pets = [
        pet_data for pet_data in pets
        if all(state in pet_data["health_states"] for state in missing_states)
    ]
    return filtered_pets

def filter_by_hard_red_flags(pets, target_pet):
    filtered_pets = pets
    # "Big Dog"
    red_flags = target_pet["red_flags"]

    if "Big Dog" in red_flags:
        filtered_pets = [
            pet_data for pet_data in filtered_pets
            if pet_data["weight"] <= 55
        ]
        print("finished filtering Big Dog")
    # "Not Good with Smaller Dogs"
    if "Not Good with Smaller Dogs" in red_flags:
        filtered_pets = [
            pet_data for pet_data in filtered_pets
            if pet_data["weight"] >= 22
        ]
        print("finished filtering Not Good with Smaller Dogs")
    # "Not Neutered"
    if "Not Neutered" in red_flags:
        filtered_pets = [
            pet_data for pet_data in filtered_pets if pet_data["sex"] == "Neutered"
        ]
        print("finished filtering Not Neutered")
    return filtered_pets

def apply_filters(pets, target_pet):
    filtered_pets = pets
    print("numbers of filtering pets: ", len(filtered_pets))
    filtered_pets = filter_by_time_range(pets, target_pet["preferred_time"])
    print("finished filter_by_time_range, reduced to: ", len(filtered_pets))
    # filtered_pets = filter_by_health_state(filtered_pets, target_pet["health_states"])
    # print("finished filter_by_health_state, reduced to: ", len(filtered_pets))
    filtered_pets = filter_by_hard_red_flags(filtered_pets, target_pet)
    print("finished filter_by_hard_red_flags, reduced to: ", len(filtered_pets))
    print("numbers of filtering pets: ", len(filtered_pets))
    return filtered_pets

# --- GPT-4o methods ---
def get_full_prompt(target_pet, pets_data):
    target_pet = json.dumps(target_pet, indent=4)
    pets_data = json.dumps(pets_data, indent=4)
    return f"""    
    Please sort the following pets for the targeted pet by calculating a total score based on the refined criteria below:
    Rules:
    1. The score ranges between 0.0 and 80.0, with higher scores indicating better matches. The calculation should be precise and include decimal points (e.g., 76.5 or 48.3). Scores above 70 should reflect highly compatible pets, and scores above 75 should be reserved for exceptionally close matches.
    
    2. Scoring criteria:
        - **Breed Similarity (25%, 20 points)**:
            - Identical breed: add 20.0 points.
            - Highly similar breed (e.g., same breed group): add 16.0 to 18.0 points.
            - Moderately similar breed: add 10.0 to 15.0 points.
            - Different breed: add 0.0 points.

        - **Character Compatibility (25%, 20 points)**: 
            - Identical characters: add 20.0 points.
            - Highly compatible characters (e.g., Friendly vs Playful): add 16.0 to 18.0 points.
            - Partially compatible characters (e.g., Friendly vs Independent): add 10.0 to 15.0 points.

        - **Dog-Walking Time Match (30%, 24 points)**:
            - Completely matching: add 24.0 points.
            - Partially overlapping times (e.g., morning vs afternoon): add 18.0 to 22.0 points.
            - Completely different: add 10.0 to 15.0 points. If breed and character compatibility are high, even different times can still score a minimum of 10 points.

        - **Red Flag Conflicts (5%, -4 points)**:
            - No conflicts: deduct 0.0 points.
            - Minor conflicts (e.g., 1 red flag): deduct 2.0 points.
            - Severe conflicts (e.g., 2 or more red flags): deduct 3.0 to 4.0 points.
    
    3. When evaluating red flags, consider only the red flags of the targeted pet. Compare these red flags to the attributes of the matching pets (e.g., breed, character, or behavior). Do not compare the red flags of one pet to another's.
        For example:
        - If the targeted pet has a red flag "Big Dog," reduce the score if the matching pet is a large breed.
        - If the targeted pet has a red flag "Barks a Lot," reduce the score if the matching pet's behavior suggests frequent barking.

        Red flags represent specific constraints or preferences of the targeted pet. You do not need to handle user-defined red flags at this time.

    4. For each pet, provide:
        - `id`: The unique identifier of the pet.
        - `score`: The calculated score rounded to one decimal place.
        - `reason`: A concise explanation of the score, covering:
            - Breed similarity.
            - Character compatibility.
            - Dog-walking time overlap.
            - Location proximity or distance penalties.
            - Any red flag conflicts.
            - Example: \"Breed similar (+20.5), same time (+30.0), no conflicts (0.0).\"
    
    5. Return Format:
        [
            {{
                "id": "pet id",
                "score": "total score",
                "reason": "reason for the score"
            }},
            ...
        ]

    The targeted pet's information is as follows:
    {target_pet}

    The pets to consider for friendship are as follows:
    {pets_data}

    Please return the results as a JSON object, sorted by highest score first, resolving ties by prioritizing pets with fewer red flag conflicts.
    """

def get_model_json(model_name: str, fullcode:str, stream: bool = False):
    print("ready to call openai")
    client = OpenAI(api_key=settings.OPENAI_API_KEY)
    response = client.chat.completions.create(
        model=model_name,
        messages = [
            {
                "role": "user",
                "content": fullcode
            }
        ],
        stream=stream
    )

    if stream:
        for chunk in response:
            print(chunk)
    else:
        return response

def ask(target_pet, pets_data):
    fullcode = get_full_prompt(target_pet, pets_data)
    response = get_model_json("gpt-3.5-turbo-0125", fullcode) # alternative: gpt-4o-mini, gpt-4o
    string = response.choices[0].message.content

    try:
            json_load = json.loads(string)
            
            # if JSON parsing is successful, save the result and return
            if isinstance(json_load, list):
                # with open('gpt_result.json', 'w') as f:
                #     json.dump(json_load, f, indent=4)
                return json_load
            else:
                print("Parsed JSON is not a list. Proceeding with regex extraction.")
    except json.JSONDecodeError:
        print("Direct JSON parsing failed. Proceeding with regex extraction.")
    
    # if JSON parsing failed, use regex to extract JSON objects
    pattern = regex.compile(r'\{(?:[^{}]|(?R))*\}')
    matches = pattern.findall(string)
    
    # parse each JSON object and save the result
    json_load = []
    for match in matches:
        try:
            json_obj = json.loads(match)
            json_load.append(json_obj)
        except json.JSONDecodeError as e:
            print(f"Failed to parse JSON object: {e}")
        
        # save the result for debug
        # with open('gpt_result.json', 'w') as f:
        #     json.dump(json_load, f, indent=4)
    
    return json_load

# --- process results ---
def id_to_display(matching_pets, target_pet, user_id):
    pet_details = []
    # if isinstance(target_pet, str):
    #     target_pet = json.loads(target_pet)
    # if isinstance(target_pet, list) and len(target_pet) > 0:
    #     pet = target_pet[0]
    #     if isinstance(pet, dict) and "fields" in pet:
    #         cleaned_target_pet = pet["fields"]
    
        
    target_location = target_pet["location"]

    # for database data
    for pet_data in matching_pets:
        try:
            pet_id = pet_data["id"]
            score = pet_data["score"]
            reason = pet_data["reason"]
            
            pet = Pet.objects.get(id=pet_id)
            print(f"pet {pet_id}", pet, score)
            # print(f"pet {pet_id}", pet, score, reason)

            pet_location = pet.location
            distance = calculate_distance(target_location, pet_location)
            
            if distance > 50:
                print(f"Skipping pet {pet_id} due to distance of {distance} miles.")
                continue

            distance_score = calculate_distance_score(distance)
            if isinstance(score, str):
                score = float(score)
            final_score = round(score + distance_score, 1)
            reason = reason.rstrip(".")
            reason = f"{reason}, distance ({distance_score:.1f} points)."

            pet_details.append({
                "id": pet.id,
                "name": pet.name,
                "breed": pet.breed,
                "age": (datetime.now().date() - pet.birth_date).days // 365,
                "weight": pet.weight,
                "distance": round(distance, 1),
                "photos": pet.photos,
                "matchScore": final_score,
                "reason": reason,
                "isFollowing": pet.followers.filter(id=user_id).exists()
            })

        except Pet.DoesNotExist:
            print(f"Pet with ID {pet_id} does not exist.")
        except Exception as e:
            print(f"Error processing pet with ID {pet_id}: {e}")
    return pet_details

# --- main method ---
def process_target_pet(target_pet_id, user_id):
    try:
        target_pet = Pet.objects.filter(id=target_pet_id).first()
        following_pet_ids = target_pet.following.all().values_list('id', flat=True)
        pets = Pet.objects.exclude(id=target_pet_id).exclude(id__in=following_pet_ids)

        target_pet = serialize('json', [target_pet])
        target_pet = json.loads(target_pet)[0]["fields"]

        fields_with_id = []

        for pet_instance in pets:
            if pet_instance.id not in following_pet_ids:
                pet_data = serialize('json', [pet_instance])
                pet_data = json.loads(pet_data)[0]["fields"]
                pet_data["id"] = pet_instance.id
                fields_with_id.append(pet_data)

        filtered_pets = fields_with_id

        filtered_pets = apply_filters(filtered_pets, target_pet)
        gpt_result = ask(target_pet, filtered_pets)
        
        detailed_results = id_to_display(gpt_result, target_pet, user_id)
        return detailed_results
    except Exception as e:
        print(f"Error processing target pet: {e}")
        return []
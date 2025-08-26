import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileSignUp.css";
import "../styles/Characters.css";
import "../styles/AddPhoto.css";
import "../styles/RedFlags.css"; 
import loadGoogleMapsAPI from '../utils/loadGoogleMapsAPI';
import { handlePhotoUpload } from './utils';
import BasicInfoPage from "./ProfileSignUpPages/BasicInfoPage";
import PhotosPage from "./ProfileSignUpPages/PhotosPage";
import CharactersPage from "./ProfileSignUpPages/CharactersPage";
import RedFlagsPage from "./ProfileSignUpPages/RedFlagsPage";
import "../styles/ProfileSignUp.css";
import "../styles/Characters.css";
import "../styles/AddPhoto.css";
import protectRedirect from "./protectRedirect";
import getCSRFToken from "./getCSRFToken";
import "../styles/RedFlags.css"; 

const sexOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" }
];

const timeOptions = [
    { value: "morning", label: "Morning" },
    { value: "afternoon", label: "Afternoon" },
    { value: "evening", label: "Evening" }
];


const charactersList = [
    { id: 1, name: "Calm", description: "Peaceful and relaxed temperament" },
    { id: 2, name: "Active", description: "High energy and playful" },
    { id: 3, name: "Love Sleep", description: "Enjoys resting and relaxing" },
    { id: 4, name: "Friendly", description: "Gets along well with others" },
    { id: 5, name: "Independent", description: "Self-reliant and confident" },
    { id: 6, name: "Protective", description: "Watchful and loyal" },
    { id: 7, name: "Curious", description: "Loves exploring new things" },
    { id: 8, name: "Gentle", description: "Soft and careful with others" },
    { id: 9, name: "Playful", description: "Always ready for fun" },
    { id: 10, name: "Social", description: "Loves meeting new friends" }
];

const redFlagsList = [
    { id: 1, name: "Not Active Dog", description: "Dogs with low energy levels" },
    { id: 2, name: "Play at Night", description: "Dogs that are active during night time" },
    { id: 3, name: "Big Dog", description: "Large sized dogs" },
    { id: 4, name: "Aggressive", description: "Dogs showing aggressive behavior" },
    { id: 5, name: "Not Neutered", description: "Dogs that haven't been neutered" },
    { id: 6, name: "Barks a Lot", description: "Dogs that bark frequently" },
    { id: 7, name: "Too Energetic", description: "Dogs with excessive energy" },
    { id: 8, name: "Not Good with Small Dogs", description: "Dogs that don't get along with smaller dogs" },
    { id: 9, name: "Resource Guarding", description: "Dogs that guard food or toys" },
    { id: 10, name: "Not Socialized", description: "Dogs that haven't been well socialized" },
    { id: 11, name: "Separation Anxiety", description: "Dogs that get anxious when left alone" },
    { id: 12, name: "Not Trained", description: "Dogs without basic training" }
];


const ProfileSignUp = () => {
    const navigate = useNavigate();
    const [shouldRender, setShouldRender] = useState(false);
    const [currentPage, setCurrentPage] = useState(1); 
    const [isLoading, setIsLoading] = useState(true); 
    const [formData, setFormData] = useState({
        name: "",
        sex: "",
        preferred_time: "",
        breed: "",
        birth_date: "",
        location: "",
        weight: "",
        health_states: [],
        characters: [],
        red_flags: [],
        photos: []
    });
    
    const [photos, setPhotos] = useState(Array(6).fill(null));
    const [selectedCharacters, setSelectedCharacters] = useState([]);

    const handleCharacterSelect = (character) => {
        if (selectedCharacters.includes(character)) {
            setSelectedCharacters((prev) => prev.filter((c) => c !== character));
        } else if (selectedCharacters.length < 3) {
            setSelectedCharacters((prev) => [...prev, character]);
        }
    };
    const [selectedFlags, setSelectedFlags] = useState([]);

    const handleFlagSelect = (flag) => {
        if (selectedFlags.includes(flag)) {
            setSelectedFlags((prev) => prev.filter((f) => f !== flag));
        } else if (selectedFlags.length < 3) {
            setSelectedFlags((prev) => [...prev, flag]);
        }
    };

    const fileInputRef = useRef(null);
    const locationInputRef = useRef(null);
    const [googleAPILoaded, setGoogleAPILoaded] = useState(false);
    const [autocomplete, setAutocomplete] = useState(null);

    useEffect(() => {
        const path = "/ProfileSignUp";
        const from = new URLSearchParams(window.location.search).get('from');
        
        if (from === 'MyProfile') {
            setShouldRender(true);
            return;
        }
        const isRedirectNeeded = protectRedirect(path, path);
        if (!isRedirectNeeded) {
            setShouldRender(true);
        }
    }, []);

    const [errors, setErrors] = useState({
        name: '',
        weight: '',
        birth_date: ''
    });

    const handleInputChange = (event) => {
        const { name, value } = event.target;
        
        // deal with different input limits
        let finalValue = value;
        let error = '';

        switch (name) {
            case 'name':
                if (formData.name.length >= 20 && value.length > 20) {
                    finalValue = formData.name;
                    error = 'Name must be less than 20 characters';
                } else {
                    finalValue = value.slice(0, 20);
                    if (finalValue.length === 20) {
                        error = 'Name must be less than 20 characters';
                    }
                }
                break;

            case 'weight':
                const weightNum = parseFloat(value);
                if (weightNum > 200) {
                    finalValue = "200";
                    error = 'Weight must be less than 200 lbs';
                }
                break;
            case 'location':
                if (value && value.length > 100) {
                    error = 'Location is too long';
                } else if (value && !/^[a-zA-Z0-9\s,.-]+$/.test(value)) {
                    error = 'Please use English characters for location';
                }
                break;
            case 'birth_date':
                const currentYear = new Date().getFullYear();
                const year = new Date(value).getFullYear();
                if (year > currentYear) {
                    error = `Birth year cannot be later than ${currentYear}`;
                    finalValue = '';
                }
                break;
        }

        setFormData(prevState => ({
            ...prevState,
            [name]: finalValue,
        }));

        setErrors(prev => ({
            ...prev,
            [name]: error
        }));
    };
    

    useEffect(() => {
        const checkPetExists = async () => {
            const from = new URLSearchParams(window.location.search).get('from');
            
            if (from === 'MyProfile') {
                setShouldRender(true);
                setIsLoading(false);
                return;
            }

            try {
                console.log("backend url", process.env.REACT_APP_BACKEND_URL);
                const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/check-pet-exists/`, {
                    method: "GET",
                    credentials: "include",
                });
    
                if (!response.ok) throw new Error("Failed to check pet existence");
    
                const data = await response.json();
    
                // Check if user is authenticated
                if (data.is_authenticated === false) {
                    console.log("User not authenticated, redirecting to register");
                    navigate("/Register");
                    return;
                }
    
                // If authenticated and has pet, go to matching
                if (data.has_pet) {
                    navigate("/Matching");
                } else {
                    // Authenticated but no pet, show profile setup
                    setShouldRender(true);
                }
            } catch (error) {
                console.error("Error checking pet existence:", error);
                navigate("/Register");
            } finally {
                setIsLoading(false);
            }
        };
        checkPetExists(); // use the check function
    }, [navigate]);
    
    
    

    const handleSelectChange = (selectedOptions) => {
        const healthStates = selectedOptions.map((option) => option.value);
        setFormData({
            ...formData,
            health_states: healthStates
        });
    };


    

    const triggerFileInput = () => {
        fileInputRef.current.click();
    };

    const handleDeletePhoto = (index) => {
        const updatedPhotos = photos.filter((photo, i) => i !== index).concat(null);
        setPhotos(updatedPhotos);
    };

    // Handler for file input change (for PhotosPage)
    const onPhotoChange = (event) => handlePhotoUpload(event, photos, setPhotos, getCSRFToken);

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        if (formData.health_states.length === 0) {
            alert("Health states cannot be empty.");
            return;
        }
        if (selectedCharacters.length === 0) {
            alert("Please select at least one character.");
            return;
        }
        if (selectedFlags.length === 0) {
            alert("Please select at least one red flag.");
            return;
        }
    
        const payload = {
            ...formData,
            health_states: formData.health_states,
            characters: selectedCharacters.map(c => c.name),
            red_flags: selectedFlags.map(f => f.name),
            photos: photos.filter(p => p !== null)
        };
    
        try {
            const csrfToken = await getCSRFToken();
            console.log('CSRF Token:', csrfToken);
            console.log('All cookies:', document.cookie);
            const from = new URLSearchParams(window.location.search).get('from');
            const isEditing = from === 'MyProfile';

            const response = await fetch(
                isEditing
                    ? `${process.env.REACT_APP_BACKEND_URL}/api/update-pet/`
                    : `${process.env.REACT_APP_BACKEND_URL}/api/ProfileSignUp/`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "X-CSRFToken": csrfToken,
                    },
                    credentials: 'include',
                    body: JSON.stringify(payload),
                }
            );

            const contentType = response.headers.get("content-type");
            if (!contentType || !contentType.includes("application/json")) {
                throw new Error("Server returned non-JSON response");
            }

            const data = await response.json();
            console.log("data", data);
            if (!response.ok) {
                throw new Error(data.error || "Failed to update profile");
            }

            alert(isEditing
                ? "Pet profile updated successfully!"
                : "Pet profile created successfully!");
            window.location.href = isEditing ? '/MyProfile' : '/Matching';
        } catch (error) {
            console.error("Fetch error:", error);
            if (error.message === "Server returned non-JSON response") {
                alert("Server error. Please try again later.");
            } else {
                alert(error.message || "Error submitting profile. Please try again.");
            }
        }
    };
    
    

    // switch page
    const handleNext = () => {
        // validate form on the first page
        if (currentPage === 1) {
            const requiredFields = ['name', 'birth_date', 'breed', 'sex', 'weight', 'location'];
            const hasEmptyFields = requiredFields.some(field => !formData[field]);
            const hasErrors = Object.values(errors).some(error => error);

            if (hasEmptyFields) {
                alert('Please fill in all required fields');
                return;
            }

            if (hasErrors) {
                alert('Please correct the errors before proceeding');
                return;
            }
        }
        
        setCurrentPage(prev => prev + 1);
    };
    const handlePrevious = () => setCurrentPage((prevPage) => prevPage - 1);

    useEffect(() => {
        loadGoogleMapsAPI()
            .then(() => {
                setGoogleAPILoaded(true);
            })
            .catch(error => {
                console.error('Failed to load Google Maps API:', error);
            });
    }, []);

    useEffect(() => {
        if (googleAPILoaded) {
            initializeAutocomplete();
        }
    
        return () => {
            if (autocomplete) {
                window.google?.maps?.event?.clearInstanceListeners(autocomplete);
            }
        };
    }, [googleAPILoaded]);

    const initializeAutocomplete = async () => {
        try {
            const maps = await loadGoogleMapsAPI();
            
            if (locationInputRef.current && !autocomplete) {
                const newAutocomplete = new maps.places.Autocomplete(locationInputRef.current, {
                    types: ['address'],
                    fields: [
                        'formatted_address',
                        'address_components',
                        'geometry'
                    ],
                    language: 'en',
                    componentRestrictions: { country: 'us' }
                });

                newAutocomplete.addListener('place_changed', () => {
                    const place = newAutocomplete.getPlace();
                    if (place.formatted_address) {
                        setFormData(prevData => ({
                            ...prevData,
                            location: place.formatted_address
                        }));
                    }
                });

                setAutocomplete(newAutocomplete);
            } else {
                console.log('Skipping autocomplete initialization:', {
                    hasInput: !!locationInputRef.current,
                    hasExistingAutocomplete: !!autocomplete
                });
            }
        } catch (error) {
            console.error('Error initializing Google Maps:', error);
        }
    };

    useEffect(() => {
        const from = new URLSearchParams(window.location.search).get('from');
        
        if (from === 'MyProfile') {
            const fetchExistingPetData = async () => {
                try {
                    const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user-pet/`, {
                        method: "GET",
                        credentials: "include",
                    });

                    if (response.ok) {
                        const data = await response.json();
                        setFormData({
                            name: data.name || "",
                            sex: data.sex || "",
                            preferred_time: data.preferred_time || "",
                            breed: data.breed || "",
                            birth_date: data.birth_date || "",
                            location: data.location || "",
                            weight: data.weight || "",
                            health_states: data.health_states || []
                        });
                        
                        const existingCharacters = charactersList.filter(char => 
                            data.characters.includes(char.name)
                        );
                        setSelectedCharacters(existingCharacters);
                        
                        const existingFlags = redFlagsList.filter(flag => 
                            data.red_flags.includes(flag.name)
                        );
                        setSelectedFlags(existingFlags);

                        const fullPhotosArray = new Array(6).fill(null);
                        data.photos.forEach((photo, index) => {
                            if (index < 6) {
                                fullPhotosArray[index] = photo;
                            }
                        });
                        setPhotos(fullPhotosArray);
                    }
                } catch (err) {
                    console.error("Error fetching existing pet data:", err);
                }
            };

            fetchExistingPetData();
        }
    }, []);

    if (!shouldRender) return null;
    if (isLoading) {
        return <div>Loading...</div>;
    }
    if (!shouldRender) {
        return null;
    }
    
  
    return (
        <div>
            <header className="AppHeader">
                <button className="header-button" onClick={() => window.location.href = "/"}>
                    Home
                </button>
            </header>
            <div className="profile-signup">
                {/* Page1: Basic info */}
                {currentPage === 1 && (
                  <BasicInfoPage
                    formData={formData}
                    errors={errors}
                    handleInputChange={handleInputChange}
                    handleSelectChange={handleSelectChange}
                    handleNext={handleNext}
                    locationInputRef={locationInputRef}
                  />
                )}
                {/* Page2: Adding photos */}
                {currentPage === 2 && (
                  <PhotosPage
                    photos={photos}
                    triggerFileInput={triggerFileInput}
                    handleDeletePhoto={handleDeletePhoto}
                    fileInputRef={fileInputRef}
                    onPhotoChange={onPhotoChange}
                    handlePrevious={handlePrevious}
                    handleNext={handleNext}
                  />
                )}
           {/* Page3: Characters */}
                {currentPage === 3 && (
                  <CharactersPage
                    charactersList={charactersList}
                    selectedCharacters={selectedCharacters}
                    handleCharacterSelect={handleCharacterSelect}
                    handlePrevious={handlePrevious}
                    handleNext={handleNext}
                  />
                )}
            {/* Page4: Red Flags */}
                {currentPage === 4 && (
                  <RedFlagsPage
                    redFlagsList={redFlagsList}
                    selectedFlags={selectedFlags}
                    handleFlagSelect={handleFlagSelect}
                    handlePrevious={handlePrevious}
                    handleSubmit={handleSubmit}
                  />
                )}
            </div>
        </div>
    );
};

export default ProfileSignUp;
import React, { useState, useEffect, useRef } from "react";
import "../styles/Matching.css";
import getCSRFToken from './getCSRFToken';
import Loading from './Loading';
import Transition from './Transition'; 
import { useNavigate } from 'react-router-dom';
import { handleLogout } from './utils';
import Header from './Header';

export const Matching = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [userPet, setUserPet] = useState(null);
    const [profiles, setProfiles] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isTransitioning, setIsTransitioning] = useState(true);
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState("");
    const [showMenu, setShowMenu] = useState(false);
    const [fetchCount, setFetchCount] = useState(0);
    const isFetchingRef = useRef(false);
    const maxFetchAttempts = 3;

    const handleTransition = () => {{
        setIsTransitioning(false);
    }}

    const handleMouseEnter = () => setShowMenu(true);
    const handleMouseLeave = () => setShowMenu(false);

    const navigate = useNavigate();

    const navigateTo = (path) => {
      console.log("path", path);
      if (path === "Homepage") {
        navigate(`/`);
      } else {
        navigate(`${path}`);
      }
      setShowMenu(false);
    };

    const fetchData = async () => {
        if (isFetchingRef.current || fetchCount >= maxFetchAttempts) {
            return;
        }

        isFetchingRef.current = true;
        try {
            const petResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pets/match-pet/`, {
                method: 'GET',
                credentials: 'include',
            });

            if (petResponse.status === 401) {
                throw new Error(petResponse.status);
            }

            const data = await petResponse.json();
            setIsLogin(true);
            setUsername(data.user.username);
            
            if (!data.pet) throw new Error('No pet data found');
            setUserPet(data.pet);

            const profilesResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pets/matching/`, {
                method: 'GET',
                credentials: 'include',
            });
            
            if (!profilesResponse.ok) throw new Error('Failed to fetch sorted profiles');
            const sortedProfiles = await profilesResponse.json();
            setProfiles(sortedProfiles.results);
            
        } catch (error) {
            console.error('Error:', error);
            if (error.message === '401') {
                window.location.href = '/Register?next=/Matching';
            } else {
                alert(`Error code: ${error.message}`);
            }
        } finally {
            isFetchingRef.current = false;
            setFetchCount((prevCount) => prevCount + 1);
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Add sort by distance function
    const handleSortByDistance = () => {
        const sortedProfiles = [...profiles].sort((a, b) => Math.abs(a.distance - b.distance));
        setProfiles(sortedProfiles);
        setCurrentIndex(0);
        console.log("Sorted by distance", sortedProfiles);
    };

    const handleSortByMatch = () => {
        const sortedProfiles = [...profiles].sort((a, b) => {
            return Math.abs(b.matchScore - a.matchScore); 
        });
        setProfiles(sortedProfiles);
        setCurrentIndex(0);
        console.log('Sorted by match', sortedProfiles);
    };

    const showPreviousProfile = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + profiles.length) % profiles.length);
    };

    const showNextProfile = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length);
    };

    const getProfile = (index) => {
        if (!profiles.length) return null;
        const profile = profiles[(currentIndex + index) % profiles.length];
        return {
            ...profile,
            matchScore: calculateMatchScore(userPet, profile)
        };
    };

    const getCardPosition = (index) => {
        const diff = (index - currentIndex + profiles.length) % profiles.length;
        if (diff === 0) return 'center';
        if (diff === 1) return 'right';
        if (diff === profiles.length - 1) return 'left';
        return 'hidden';
    };

    const handleWagClick = async (profileId) => {
        if (!profileId) {
            console.error('Profile ID is undefined');
            return;
        }

        try {

            const isFollowing = profiles.find(p => p.id === profileId)?.isFollowing;
            const endpoint = isFollowing ? 'unfollow-pet' : 'follow-pet';

            const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pets/${profileId}/${endpoint}/`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'X-CSRFToken': await getCSRFToken(),
                }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Failed to ${isFollowing ? 'unfollow' : 'follow'} pet: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            
            const updatedProfiles = profiles.map(profile => {
                if (profile.id === profileId) {
                    return { ...profile, isFollowing: !isFollowing };
                }
                return profile;
            });
            setProfiles(updatedProfiles);
        } catch (error) {
            console.error('Error:', error);
            alert(`Unable to ${isFollowing ? 'unfollow' : 'follow'} pet: ${error.message}. Please try again or contact support if the issue persists.`);
        }
    };

    const handleLoginClick = () => {
        window.location.href = '/Register';
    };
    
    return (
        <div className="matching-container">
            <Header 
                username={username}
                isLogin={isLogin}
                handleLogin={handleLoginClick}
                menuItems={[
                    { label: "Homepage", path: "/" },
                    { label: "Profile", path: "/MyProfile" },
                    { label: "Friends", path: "/Friends" }
                ]}
            />

            {isLoading ? (
                isTransitioning ? (
                <div className="transition-overlay">
                    <Transition onFinish={handleTransition} /> 
                </div>
                ) : (
                <div>
                    <Loading />
                </div>
                )
            ) : !isLogin ? (
                <div className="no-login-message">
                    <h2>Please login first</h2>
                    <button onClick={() => window.location.href = '/Register'}>
                        Login / Register
                    </button>
                </div>
            ) : !userPet ? (
                <div className="no-pet-message">
                    <h2>Please set up your pet profile first</h2>
                    <button onClick={() => window.location.href = '/ProfileSignUp'}>
                        Set Up Profile
                    </button>
                </div>
            ) : profiles.length === 0 ? (
                <div className="no-matches-message">
                    <h2>No matches found</h2>
                    <p>Check back later for new potential matches!</p>
                </div>
            ) : (
                <>
                    <div className="controls">
                        <button className="sort-button" onClick={handleSortByDistance}>
                            Sort by distance
                        </button>
                        <button className="sort-button" onClick={handleSortByMatch}>
                            Sort by match
                        </button>
                    </div>

                    <div className="cards-container">
                        {profiles.map((profile, index) => {
                            const position = getCardPosition(index);
                            if (position === 'hidden') return null;

                            const { photos = [], name, breed, age, weight, distance } = profile;

                            return (
                                <div key={index} className={`profile-card ${position}`}>
                                    <div className="match-score">
                                        Match: {profile.matchScore}%
                                    </div>
                                    <img
                                        src={photos.length > 0 ? photos[0] : '/image/default.png'}
                                        alt={`${name}'s photo`}
                                        className="profile-photo"
                                    />
                                    <div className="profile-info">
                                        <div className="profile-name">{name}</div>
                                        <p className="profile-details">
                                            {breed}, {age} years old, {weight} lbs
                                            <br />
                                            {distance} miles away from you
                                        </p>
                                    </div>
                                    <button 
                                        className="wag-button"
                                        onClick={() => handleWagClick(profile.id)}
                                    >
                                        {profile.isFollowing ? 'Wagging!' : 'Wag your tail'}
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                    <button className="arrow left-arrow" onClick={showPreviousProfile}>{"<"}</button>
                    <button className="arrow right-arrow" onClick={showNextProfile}>{">"}</button>
                </>
            )}
        </div>
    );
    
};

export default Matching;
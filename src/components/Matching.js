import React, { useState } from "react";
import "../styles/Matching.css";

const profiles = [
    { name: "Kiwi", breed: "Yorkshire Terrier", age: 7, weight: 8, distance: 5, image: "/images/kiwi.jpg" },
    { name: "Cake", breed: "Welsh Corgi", age: 2, weight: 10, distance: 36.8, image: "/images/cake.jpg" },
    { name: "Buddy", breed: "Golden Retriever", age: 3, weight: 70, distance: 10, image: "/images/buddy.jpg" },
    { name: "Max", breed: "Labrador", age: 4, weight: 65, distance: 12, image: "/images/max.jpg" },
    { name: "Bella", breed: "Poodle", age: 5, weight: 50, distance: 8, image: "/images/bella.jpg" },
    { name: "Charlie", breed: "Beagle", age: 6, weight: 25, distance: 15, image: "/images/charlie.jpg" },
    { name: "Lucy", breed: "Bulldog", age: 3, weight: 40, distance: 20, image: "/images/lucy.jpg" },
    { name: "Daisy", breed: "Boxer", age: 4, weight: 60, distance: 18, image: "/images/daisy.jpg" }
];

export const Matching = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    const getCardPosition = (index) => {
        const diff = (index - currentIndex + profiles.length) % profiles.length;
        if (diff === 0) return 'center';
        if (diff === 1) return 'right';
        if (diff === profiles.length - 1) return 'left';
        return 'hidden';
    };

    const showPreviousProfile = () => {
        setCurrentIndex((prevIndex) => (prevIndex - 1 + profiles.length) % profiles.length);
    };

    const showNextProfile = () => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % profiles.length);
    };

    return (
        <div className="matching-container">
            <div className="controls">
                <button className="sort-button">Sort by destination</button>
                <button className="filter-button">Filter</button>
            </div>

            <div className="cards-container">
                {profiles.map((profile, index) => (
                    <div 
                        key={profile.name}
                        className={`profile-card ${getCardPosition(index)}`}
                    >
                        <div 
                            className="profile-image" 
                            style={{ backgroundImage: `url(${profile.image})` }}
                        />
                        <div className="profile-name">{profile.name}</div>
                        <p className="profile-details">
                            {profile.breed}, {profile.age} years old, {profile.weight} lbs
                            <br />
                            {profile.distance} miles away from you
                        </p>
                        <button className="wag-button">Wag your tail</button>
                    </div>
                ))}
            </div>

            <button className="arrow left-arrow" onClick={showPreviousProfile}>{"<"}</button>
            <button className="arrow right-arrow" onClick={showNextProfile}>{">"}</button>
        </div>
    );
};

export default Matching;
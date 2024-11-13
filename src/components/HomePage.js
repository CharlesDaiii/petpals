// src/components/HomePage.js
import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import protectRedirect from './protectRedirect';

function HomePage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const handleGetStarted = () => {
    protectRedirect("", "ProfileSignUp");
  }

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await protectRedirect("", "", {}, false);
        console.log("Response:", response);

        if (response && response.isAuthenticated) {
            setIsLoggedIn(true);
        }
    } catch (error) {
        console.error("Error in checkAuthStatus:", error);
    }
    };

    checkAuthStatus();
  }, []);

  const handleLogin = () => {
    if (isLoggedIn) {
      document.cookie = "session_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
      setIsLoggedIn(false);
      alert("Logged out successfully");
    } else {
        window.location.href = "/Register";
    }
  }

  return (
    <div className="HomePage">
      <header className="AppHeader">
        <button className="header-button">Home</button>
        <button className="header-button" onClick={handleLogin}>
          {isLoggedIn ? "Logout" : "Login"}
        </button>
      </header>

      <div className="Frame2">
        <img className="HeaderPic" src={`${process.env.PUBLIC_URL}/image/header.jpg`} alt="Header" />
        <div className="Frame1">
          <div className="SwipeAdoptLove">
            <span className="black-text">Connect. </span>
            <span className="highlighted-text">Match</span>
            <span className="black-text">.Wag!</span>
          </div>
          <button className="GetStartedButton" onClick={handleGetStarted}>Get Started</button>
        </div>
      </div>

      <div className="Group7">
        <div className="PetPalsPromise">Pet Pal Promise</div>
        <div className="PawPrint2">
          <div className="G3023">
            <img src={`${process.env.PUBLIC_URL}/image/g3023.svg`} alt="Paw Print" />
          </div>
        </div>
      </div>

      <div className="Frame">
        <div className="Frame-mini">
          <img className="Owner1" src={`${process.env.PUBLIC_URL}/image/1.svg`} alt="Owner Profile" />
          <div className="SetYourProfile">SET YOUR PROFILE</div>
        </div>
        <div className="Frame-mini">
          <img className="PetShop1" src={`${process.env.PUBLIC_URL}/image/2.svg`} alt="Pet Shop" />
          <div className="MatchAndChat">MATCH AND CHAT</div>
        </div>
        <div className="Frame-mini">
          <img className="PetsAllowed1" src={`${process.env.PUBLIC_URL}/image/3.svg`} alt="Pets Allowed" />
          <div className="FindPlaceToWalking">FIND PLACE TO WALKING</div>
        </div>
      </div>
    </div>
  );
}

export default HomePage;


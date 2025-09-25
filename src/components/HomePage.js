import React, { useState, useEffect } from 'react';
import '../styles/HomePage.css';
import protectRedirect from './protectRedirect';
import Header from './Header';
import getCSRFToken from './getCSRFToken';
import SplitText from "../utils/SplitText";
import CardSwap, { Card } from '../utils/CardSwap'
import StarBorder from '../utils/StarBorder'

function HomePage() {
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/redirect/`, {
          method: 'GET',
          credentials: 'include',
        });

        if (response.ok) {
          const data = await response.json();
          if (data && data.is_authenticated) {
            setIsLogin(true);
            setUsername(data.username);
          } else {
            setIsLogin(false);
            setUsername("");
          }
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  const handleMouseEnter = () => {
    setShowMenu(true);
  };

  const handleMouseLeave = () => {
    setShowMenu(false);
  };

  const navigateTo = (path) => {
    window.location.href = path; 
    setShowMenu(false);
  };

  const handleGetStarted = () => {
    protectRedirect("", "/ProfileSignUp");
  };

  const handleLoginClick = async () => {
    if (isLogin) {
      fetch(`${process.env.REACT_APP_BACKEND_URL}/api/pets/logout/`, {
        method: "POST",
        credentials: "include",
        headers: {
          "X-CSRFToken": await getCSRFToken(),
        }
      })
      .then(() => {
        setIsLogin(false);
        setUsername("");
      });
    } else {
      window.location.href = '/Register';
    };
  };


  return (
    <div className="HomePage">
      <Header 
        username={username}
        isLogin={isLogin}
        handleLogin={handleLoginClick}
        menuItems={[
          { label: "Profile", path: "/MyProfile" },
          { label: "Friends", path: "/Friends" },
          { label: "Matching", path: "/Matching" },
          { label: "Chat", path: "/Chat" }
        ]}
      />

      {/* Other Content */}
      <div className="home-header-section">
        <img className="HeaderImage" src={`${process.env.PUBLIC_URL}/static/image/header.jpg`} alt="Header" />
        <div className="home-intro-text">
          <div className="home-tagline">
            <SplitText text="Connect." className="home-text-black"/>
            <SplitText text="Match.Wag!" className="home-text-highlight"/>
          </div>
          <button class="GetStartedButton" onClick={handleGetStarted}>Get Started</button>
        </div>
        
      </div>


      <div style={{ display: 'flex' ,gap: '20px', alignItems: 'flex-start' }}>
        <div className="petpal-promise">
          <h2 className="promise-title">Petpal Promise</h2>
          <p className="promise-subtitle">
            Connecting pet lovers, matching perfect companions, and making every walk a wagging adventure.
          </p>
          <img
            className="promise-bg"
            src={`${process.env.PUBLIC_URL}/static/image/g3023.svg`}
            alt="Paw Print"
          />
        </div>
        <CardSwap
          width={300}
          height={300}
          cardDistance={60}
          verticalDistance={70}
          delay={5000}
          pauseOnHover={false}
        >
          <Card>
            {/* <h3>SET YOUR PROFILE</h3> */}
            <div className="FeatureCard">
              <img className="FeatureImage" src={`${process.env.PUBLIC_URL}/static/image/1.svg`} alt="Owner Profile" />
              <div className="FeatureTitle">SET YOUR PROFILE</div>
            </div>
          </Card>
          <Card>
            {/* <h3>MATCH AND CHAT</h3> */}
            <div className="FeatureCard">
              <img className="FeatureImage" src={`${process.env.PUBLIC_URL}/static/image/2.svg`} alt="Pet Shop" />
              <div className="FeatureTitle">MATCH AND CHAT</div>
            </div>
          </Card>
          <Card>
            {/* <h3>FIND PLACE TO WALKING</h3> */}
            <div className="FeatureCard">
              <img className="FeatureImage" src={`${process.env.PUBLIC_URL}/static/image/3.svg`} alt="Pets Allowed" />
              <div className="FeatureTitle">FIND PLACE TO WALKING</div>
            </div>
          </Card>
        </CardSwap>
      </div>
    </div>
  );
}

export default HomePage;

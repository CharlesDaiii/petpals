import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import "../styles/OtherProfile.css";
import { useNavigate } from "react-router-dom";
import Loading from './Loading';

const OtherProfile = () => {
  const { id } = useParams();
  const [petData, setPetData] = useState(null);
  const [error, setError] = useState(null);
  const [followersCount, setFollowersCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [showMenu, setShowMenu] = useState(false);

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

  const handleLogout = () => {
    fetch(`${process.env.REACT_APP_BACKEND_URL}/api/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": getCSRFToken(),
      },
      credentials: "include",
    })
      .then((response) => {
        if (response.ok) {
          setIsLogin(false);
          setUsername("");
        }
      })
      .catch((err) => console.error("Logout error:", err));
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/redirect/`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        });

        if (response.ok) {
          const data = await response.json();
          setIsLogin(data.is_authenticated);
          if (data.is_authenticated) {
            setUsername(data.username);
          }
        }
      } catch (err) {
        console.error("Error checking login status:", err);
      }
    };

    checkLoginStatus();
  }, []);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/user-pet/${id}/`, {
          method: "GET",
          credentials: "include",
        });
        
        if (response.ok) {
          const data = await response.json();
          console.log("data", data);
          setPetData(data);
        } else {
          throw new Error(`Failed to fetch pet data: ${response.status}`);
        }
      } catch (err) {
        console.error("Error details:", err);
        setError(err.message);
      }
    };

    const fetchFriendsData = async () => {
      try {
        const followersResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/followers/?id=${id}`, {
          credentials: "include",
        });
        if (followersResponse.ok) {
          const data = await followersResponse.json();
          setFollowersCount(data.followers_count || 0);
        }

        const followingResponse = await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/following/?id=${id}`, {
          credentials: "include",
        });
        if (followingResponse.ok) {
          const data = await followingResponse.json();
          setFollowingCount(data.following_count || 0);
        }
      } catch (err) {
        console.error("Error fetching friends data:", err);
      }
    };

    fetchPetData();
    fetchFriendsData();
  }, [id]);

  if (error) return <div className="error">{error}</div>;
  if (!petData) return <div><Loading /></div>;

  const {
    name = 'null',
    birth_date = 'null',
    breed = 'null',
    sex = 'null',
    weight = 'null',
    location = 'null',
    preferred_time = 'null',
    health_states = 'null',
    characters = 'null',
    red_flags = 'null',
    photos = []
  } = petData;

  const InfoItem = ({ label, value }) => {
    const formatValue = (value) => {
      if (Array.isArray(value)) {
        return value.join(', ');
      }
      if (typeof value === 'string') {
        return value.split(',').map((item) => item.trim()).join(', ');
      }
      return value || 'N/A';
    };

    return (
      <div className="info-item">
        <span className="label-text">{label}:</span>
        <span className="info-value">{formatValue(value)}</span>
      </div>
    )
  };

  return (
    <div className="my-profile-container">
      <header className="other-profile-header">
        <div
          className="header-button username"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {username}
          {showMenu && (
            <div className="dropdown-menu">
              <button onClick={() => navigateTo("Homepage")}>Homepage</button>
              <button onClick={() => navigateTo("/Friends")}>Friends</button>
              <button onClick={() => navigateTo("/Matching")}>Matching</button>
            </div>
          )}
        </div>
        <button className="header-button" onClick={handleLogout}>
          {isLogin ? "Logout" : "Login"}
        </button>
      </header>
      
      <div className="photo-placeholder">
        {photos && photos.length > 0 && photos[0] ? (
          <img
            src={photos[0]}
            alt={`${name}'s photo`}
            className="profile-photo"
          />
        ) : (
          <p>No photo available</p>
        )}
      </div>

      <div className="group">
        <span className="span">{name}</span>
        <div className="info-grid">
          <div className="info-item">
            <span className="label-text">Sex:</span>
            <span className="info-value">{sex}</span>
          </div>
          <div className="info-item">
            <span className="label-text">Breed:</span>
            <span className="info-value">{breed}</span>
          </div>
          <div className="info-item">
            <span className="label-text">Dog-walking time:</span>
            <span className="info-value">{preferred_time}</span>
          </div>
          <div className="info-item">
            <span className="label-text">Age:</span>
            <span className="info-value">
              {new Date().getFullYear() - new Date(birth_date).getFullYear()} years old
            </span>
          </div>
          <div className="info-item">
            <span className="label-text">Weight:</span>
            <span className="info-value">{weight} lbs</span>
          </div>
          <div className="info-item">
            <span className="label-text">Location:</span>
            <span className="info-value">{location}</span>
          </div>
          <InfoItem label="Health States" value={health_states} />
          <InfoItem label="Character" value={characters} />
          <InfoItem label="Red Flags" value={red_flags} />
        </div>
      </div>

      <div className="shots-followers">
        <div className="followers-section">
          <div className="count">{followersCount}</div>
          <div className="label">Followers</div>
        </div>
        <div className="divider"></div>
        <div className="following-section">
          <div className="count">{followingCount}</div>
          <div className="label">Following</div>
        </div>
      </div>
    </div>
  );
};

export default OtherProfile;
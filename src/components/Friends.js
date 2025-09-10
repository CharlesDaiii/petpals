import React, { useState, useEffect } from "react";
import "../styles/Friends.css";
import getCSRFToken from "./getCSRFToken";
import { useNavigate } from "react-router-dom";
import Header from './Header';

const Friends = () => {
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [error, setError] = useState(null);
  const [isLogin, setIsLogin] = useState(false);
  const [username, setUsername] = useState("");
  const [showMenu, setShowMenu] = useState(false);  

  const updateData = async (endpoint, setState) => {
    try {
        const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': await getCSRFToken(),
            },
            credentials: 'include',
        });
        if (response.ok) {
            const updatedData = await response.json();
            setState(updatedData);
        }
    } catch (err) {
        console.error(`Error updating data from ${endpoint}:`, err);
        setError(err.message);
    }
  };

  const startUpdating = () => {
    const intervalId = setInterval(async () => {
      await updateData('/api/pets/followers/', (data) => setFollowers(data.followers));
      await updateData('/api/pets/following/', (data) => setFollowing(data.following));
    }, 5000);
    return intervalId;
  };

  useEffect(() => {
    fetchUserData();
    updateData('/api/pets/followers/', (data) => setFollowers(data.followers));
    updateData('/api/pets/following/', (data) => setFollowing(data.following));
    const intervalId = startUpdating();
    return () => clearInterval(intervalId);
  }, []);

  // Fetch login state and username
  const fetchUserData = async () => {
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
        if (data.is_authenticated) {
          setIsLogin(true);
          setUsername(data.username);
        }
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
    }
  };

  const handleLoginClick = () => {
    window.location.href = '/Register';
  };

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

  const handleFollowAction = async (action, petId, setState) => {
    const endpoint =
      action === "follow"
        ? `/api/pets/${petId}/wag-back/`
        : `/api/pets/${petId}/unfollow-pet/`;
  
    try {
      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}${endpoint}`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "X-CSRFToken": await getCSRFToken(),
        },
      });
  
      if (response.ok) {
        const updatedData = await response.json();
  
        // update the state
        setState((prevState) =>
          action === "follow"
            ? prevState.map((item) =>
                item.id === updatedData.id ? updatedData : item
              )
            : prevState.filter((item) => item.id !== petId)
        );
      }
    } catch (err) {
      console.error(`Error during ${action}:`, err);
    }
  };  
  
  // if (isLoading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;

  const handleFollowing = async (followerId) => {
    await handleFollowAction("follow", followerId, setFollowers);
    await updateData('/api/pets/following/', (data) => setFollowing(data.following));
  };
  
  const handleUnfollow = async (followingId) => {
    const isConfirmed = window.confirm("Are you sure you want to unfollow this user?");
    if (isConfirmed) {
      await handleFollowAction("unfollow", followingId, setFollowing);
      window.alert("You have unfollowed this user.");
      await updateData('/api/pets/following/', (data) => setFollowing(data.following));
    }
  };
  
  
  // friend item component
  const FriendItem = ({ friend, onWagBack, onUnfollow, isFollower }) => {
    const { id, name, photo, isFriend } = friend;

    const label = isFriend ? 'Friends' : (isFollower ? 'Wag back' : 'Wagging');
    const onClick = (isFollower && !isFriend) ? () => onWagBack(friend.id) : () => onUnfollow(friend.id);
  
    return (
      <div className="friend-item" key={id}>
        <div className="friend-avatar">
          <img
            src={photo ? photo : '/image/default.png'}
            alt={`${name}'s avatar`}
          />
        </div>
        <div className="friend-content">
          <div className="friend-text">
            {isFollower ? '' : 'You wag '}
            <span
              className="friend-name"
              onClick={() => window.location.href = `/OtherProfile/${id}`}
            >
              {name}
            </span>
            {isFollower ? ' wags your tail and says hi' : ` 's tail and say hi`}
          </div>

          <button
            className={`wag-back-button ${isFriend || !isFollower ? "wagging" : ""}`}
            onClick={onClick}
          >
            {label}
          </button>
        </div>
      </div>
    );
  };

  // friend list component
  const FriendList = ({ friends, onWagBack, onUnfollow, isFollower }) => (
    <div className="friends-list">
      {friends.map(friend => {
        return (
          <FriendItem
          key={friend.id}
          friend={friend}
          onWagBack={onWagBack}
          onUnfollow={onUnfollow}
          isFollower={isFollower}
        />
        )
      })}
    </div>
  );

  return (
    <div className="friends-container">
      <Header 
        username={username}
        isLogin={isLogin}
        handleLogin={handleLoginClick}
        menuItems={[
          { label: "Homepage", path: "/" },
          { label: "Profile", path: "/MyProfile" },
          { label: "Matching", path: "/Matching" },
          { label: "Chat", path: "/Chat" }
        ]}
      />

      {/* Friends Content */}
      <h1 className="main-title">Friends</h1>
      <div className="friends-content">
        {/* Left Column - Followers */}
        <div className="friends-column">
          <h2 className="column-title">
            <span className="count">{followers.length}</span> Followers
          </h2>
          <FriendList 
            friends={followers} 
            onWagBack={handleFollowing}
            onUnfollow={handleUnfollow}
            isFollower={true}
          />
        </div>

        {/* Right Column - Following */}
        <div className="friends-column">
          <h2 className="column-title">
            <span className="count">{following.length}</span> Following
          </h2>
          <FriendList
            friends={following}
            onWagBack={handleFollowing}
            onUnfollow={handleUnfollow}
            isFollower={false}
          />
        </div>
      </div>
    </div>
  );
};

export default Friends;

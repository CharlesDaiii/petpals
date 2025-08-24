import { useState, useEffect } from "react";

const useFriendsData = () => {
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
  
    useEffect(() => {
      const fetchFriendsData = async () => {
        try {
          const [followersResponse, followingResponse] = await Promise.all([
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/followers/`, { credentials: "include" }),
            fetch(`${process.env.REACT_APP_BACKEND_URL}/api/following/`, { credentials: "include" })
          ]);
  
          if (followersResponse.ok) {
            const followersData = await followersResponse.json();
            setFollowers(followersData.followers);
          }
  
          if (followingResponse.ok) {
            const followingData = await followingResponse.json();
            setFollowing(followingData.following);
          }
        } catch (err) {
          console.error("Error fetching friends data:", err);
        }
      };
  
      fetchFriendsData();
    }, []);
  
    return { followers, following };
  };

  export default useFriendsData;
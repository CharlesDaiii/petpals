import { useState, useEffect } from "react";

const useUserData = () => {
    const [isLogin, setIsLogin] = useState(false);
    const [username, setUsername] = useState("");
  
    useEffect(() => {
      const fetchUserData = async () => {
        try {
          const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/auth/redirect/`, {
            method: "GET",
            headers: { "Content-Type": "application/json" },
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
  
      fetchUserData();
    }, []);
  
    return { isLogin, setIsLogin, username, setUsername };
  };

  export default useUserData;
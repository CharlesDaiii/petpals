import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { handleLogout } from '../utils';
import getCSRFToken from "../getCSRFToken";

const Header = ({ username, isLogin, setIsLogin, setUsername }) => {
  const [showMenu, setShowMenu] = useState(false);
  const navigate = useNavigate();

  const handleMouseEnter = () => setShowMenu(true);
  const handleMouseLeave = () => setShowMenu(false);

  const navigateTo = (path) => {
    if (path === "Homepage") {
      navigate(`/`);
    } else {
      navigate(`${path}`);
    }
    setShowMenu(false);
  };

  return (
    <header className="AppHeader">
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
      <button 
        className="header-button" 
        onClick={() => handleLogout(isLogin, setIsLogin, setUsername, getCSRFToken)}
      >
        {isLogin ? "Logout" : "Login"}
      </button>
    </header>
  );
};

export default Header;
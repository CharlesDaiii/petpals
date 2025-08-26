import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';

function Header({ username, isLogin, handleLogin, menuItems }) {
  const [showMenu, setShowMenu] = useState(false); 
  const navigate = useNavigate();

  const handleMouseEnter = () => {
    setShowMenu(true);
  };

  const handleMouseLeave = () => {
    setShowMenu(false);
  };

  const navigateTo = (path) => {
    navigate(path);
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
            {menuItems.map((item) => (
              <button key={item.path} onClick={() => navigateTo(item.path)}>
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>
      <button className="header-button" onClick={handleLogin}>
        {isLogin ? "Logout" : "Login"}
      </button>
    </header>
  );
}

Header.propTypes = {
  username: PropTypes.string,
  isLogin: PropTypes.bool.isRequired,
  handleLogin: PropTypes.func.isRequired,
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ),
};

Header.defaultProps = {
  menuItems: [],
};

export default Header;

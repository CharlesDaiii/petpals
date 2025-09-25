import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import '../styles/Header.css';
import BubbleMenu from '../utils/BubbleMenu';
import { handleLogout } from './utils';
import getCSRFToken from './getCSRFToken';

function Header({ username, isLogin, handleLogin, setIsLogin, setUsername, menuItems }) {
  const navigate = useNavigate();

  // Unified login/logout handler that works with both prop patterns
  const handleLoginLogout = () => {
    if (handleLogin) {
      // Use the provided handleLogin function (for pages like HomePage, Matching, etc.)
      handleLogin();
    } else if (setIsLogin && setUsername) {
      // Use the handleLogout utility function (for Profile pages)
      handleLogout(isLogin, setIsLogin, setUsername, getCSRFToken);
    }
  };

  // Create enhanced menu items that include navigation functionality
  const createMenuItems = () => {
    const baseItems = [
      {
        label: 'Home',
        href: '#',
        ariaLabel: 'Home',
        rotation: -8,
        hoverStyles: { bgColor: '#3b82f6', textColor: '#ffffff' },
        onClick: () => navigate('/')
      },
      {
        label: 'Matching',
        href: '#',
        ariaLabel: 'Matching',
        rotation: 8,
        hoverStyles: { bgColor: '#10b981', textColor: '#ffffff' },
        onClick: () => navigate('/Matching')
      },
      {
        label: 'Friends',
        href: '#',
        ariaLabel: 'Friends',
        rotation: -5,
        hoverStyles: { bgColor: '#f59e0b', textColor: '#ffffff' },
        onClick: () => navigate('/Friends')
      },
      {
        label: 'Chat',
        href: '#',
        ariaLabel: 'Chat',
        rotation: 5,
        hoverStyles: { bgColor: '#ef4444', textColor: '#ffffff' },
        onClick: () => navigate('/chat')
      }
    ];

    // Add user-specific items when logged in
    if (isLogin) {
      baseItems.push({
        label: 'Profile',
        href: '#',
        ariaLabel: 'My Profile',
        rotation: -8,
        hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' },
        onClick: () => navigate('/MyProfile')
      });

      // Add username as a menu item
      baseItems.push({
        label: 'Logout',
        href: '#',
        ariaLabel: 'User Menu',
        rotation: 8,
        hoverStyles: { bgColor: '#6b7280', textColor: '#ffffff' },
        onClick: handleLoginLogout // This will handle logout
      });
    } else {
      // Add login item when not logged in
      baseItems.push({
        label: 'Login',
        href: '#',
        ariaLabel: 'Login',
        rotation: -8,
        hoverStyles: { bgColor: '#8b5cf6', textColor: '#ffffff' },
        onClick: handleLoginLogout
      });
    }

    return baseItems;
  };

  return (
    <header>
      <BubbleMenu
        logo={<span style={{ fontWeight: 700, color: '#3b82f6' }}>PetPals</span>}
        items={createMenuItems()}
        menuAriaLabel="Toggle navigation"
        menuBg="#fcf5f7"
        menuContentColor="#111111"
        useFixedPosition={false}
        animationEase="back.out(1.5)"
        animationDuration={0.5}
        staggerDelay={0.12}
        onMenuClick={(isOpen) => {
          // Handle menu state changes if needed
        }}
      />
    </header>
  );
}

Header.propTypes = {
  username: PropTypes.string,
  isLogin: PropTypes.bool.isRequired,
  handleLogin: PropTypes.func, // Optional - for pages that provide their own handler
  setIsLogin: PropTypes.func, // Optional - for Profile pages
  setUsername: PropTypes.func, // Optional - for Profile pages
  menuItems: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
    })
  ),
};

Header.defaultProps = {
  menuItems: [],
  handleLogin: null,
  setIsLogin: null,
  setUsername: null,
};

export default Header;

// src/components/Header.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check login status
    const checkLoginStatus = () => {
      const token = localStorage.getItem('token');
      const userData = localStorage.getItem('user');
      
      if (token && userData) {
        setIsLoggedIn(true);
        try {
          setUser(JSON.parse(userData));
        } catch (error) {
          console.error('Error parsing user data:', error);
          setUser(null);
        }
      } else {
        setIsLoggedIn(false);
        setUser(null);
      }
    };

    // Check on component mount
    checkLoginStatus();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkLoginStatus();
    };

    window.addEventListener('storage', handleStorageChange);
    
    // Also check when localStorage changes in same tab
    const originalSetItem = localStorage.setItem;
    const originalRemoveItem = localStorage.removeItem;
    
    localStorage.setItem = function(key, value) {
      originalSetItem.apply(this, arguments);
      if (key === 'token' || key === 'user') {
        checkLoginStatus();
      }
    };
    
    localStorage.removeItem = function(key) {
      originalRemoveItem.apply(this, arguments);
      if (key === 'token' || key === 'user') {
        checkLoginStatus();
      }
    };

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      localStorage.setItem = originalSetItem;
      localStorage.removeItem = originalRemoveItem;
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'en' ? 'zh' : 'en';
    i18n.changeLanguage(newLang);
  };

  return (
    <header className="header">
      <nav className="navbar">
        <div className="nav-container">
          <div className="logo-section">
            <Link to="/" className="nav-logo">
              🏠 {t('welcome')}
            </Link>
          </div>
          
          <div className="nav-menu">
            <Link to="/products" className="nav-link nav-text">
              {t('categories')}
            </Link>
            <Link to="/cart" className="nav-link nav-text">
              {t('cart')}
            </Link>
            <Link to="/about" className="nav-link nav-text">
              {t('aboutUs')}
            </Link>
            <Link to="/contact" className="nav-link nav-text">
              {t('contactUs')}
            </Link>
            
            {/* Show order history when logged in */}
            {isLoggedIn && (
              <Link to="/order-history" className="nav-link nav-text">
                {t('orderInquiry')}
              </Link>
            )}
          </div>
          
          <div className="nav-controls">
            {/* Show Login only when NOT logged in - next to language toggle */}
            {!isLoggedIn && (
              <Link to="/login" className="nav-link nav-text">
                {t('login')}
              </Link>
            )}
            
            {/* Show user section when logged in - next to language toggle */}
            {isLoggedIn && (
              <div className="user-section">
                <Link to="/profile" className="nav-link nav-icon-text" title={t('userProfile')}>
                  👤
                  {user && user.username && (
                    <span className="username">{user.username}</span>
                  )}
                </Link>
                <button onClick={handleLogout} className="nav-link logout-btn">
                  {t('logout')}
                </button>
              </div>
            )}
            
            <button onClick={toggleLanguage} className="lang-toggle">
              {i18n.language === 'en' ? '中文' : 'English'}
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
};

export default Header;
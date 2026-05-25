import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [themeMode, setThemeMode] = useState('light');

  const applyTheme = (nextMode) => {
    if (nextMode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  useEffect(() => {
    localStorage.removeItem('dayout-theme');
    const storedMode = localStorage.getItem('dayout-mode') || 'light';
    setThemeMode(storedMode);
    applyTheme(storedMode);
  }, []);

  const handleThemeToggle = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    localStorage.setItem('dayout-mode', nextMode);
    applyTheme(nextMode);
  };

  return (
    <header className="header">
      <div className="header-container">
        <div className="logo">
          <Link to="/">DayOut</Link>
        </div>
        <nav className="nav">
          <ul className="nav-list">
            {isAuthenticated ? (
              <>
                {user?.role === 'admin' && (
                  <li><Link to="/admin">Admin</Link></li>
                )}
                {user?.role !== 'admin' && (
                  <>
                    <li><Link to="/home">Home</Link></li>
                    <li><Link to="/about">About</Link></li>
                    <li><Link to="/contact">Contact</Link></li>
                    <li><Link to="/past-itineraries">Past Itineraries</Link></li>
                  </>
                )}
                <li><Link to="/profile">Profile</Link></li>
              </>
            ) : (
              <>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/login">Login</Link></li>
                <li><Link to="/register">Register</Link></li>
              </>
            )}
          </ul>
        </nav>
        <button
          type="button"
          className={`theme-toggle ${themeMode === 'dark' ? 'is-dark' : ''}`}
          onClick={handleThemeToggle}
          aria-label="Toggle theme mode"
          title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <span>{themeMode === 'dark' ? 'Dark' : 'Light'}</span>
          <span className="theme-toggle-indicator" aria-hidden="true"></span>
        </button>
      </div>
    </header>
  );
};

export default Header;

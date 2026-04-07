import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Header.css';

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [themeMode, setThemeMode] = useState('light');
  const [themeName, setThemeName] = useState('coastal');

  const applyTheme = (nextTheme, nextMode) => {
    const modeSuffix = nextMode === 'dark' ? '-dark' : '';
    document.documentElement.setAttribute('data-theme', `${nextTheme}${modeSuffix}`);
  };

  useEffect(() => {
    const storedTheme = localStorage.getItem('dayout-theme') || 'coastal';
    const storedMode = localStorage.getItem('dayout-mode') || 'light';
    setThemeName(storedTheme);
    setThemeMode(storedMode);
    applyTheme(storedTheme, storedMode);
  }, []);

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
      </div>
    </header>
  );
};

export default Header;

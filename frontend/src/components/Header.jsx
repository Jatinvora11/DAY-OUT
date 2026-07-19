import React, { useEffect, useState, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import './Header.css';

/* ── SVG icons ─────────────────────────────────────────────────────────────── */
const SunIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="5"/>
    <line x1="12" y1="1"  x2="12" y2="3"/>
    <line x1="12" y1="21" x2="12" y2="23"/>
    <line x1="4.22" y1="4.22"   x2="5.64" y2="5.64"/>
    <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
    <line x1="1" y1="12"  x2="3" y2="12"/>
    <line x1="21" y1="12" x2="23" y2="12"/>
    <line x1="4.22" y1="19.78"  x2="5.64" y2="18.36"/>
    <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
  </svg>
);

const MoonIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
  </svg>
);

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const [themeMode, setThemeMode] = useState('light');
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const menuRef = useRef(null);

  /* ── Theme ──────────────────────────────────────────────────────────────── */
  const applyTheme = (mode) => {
    if (mode === 'dark') {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
  };

  useEffect(() => {
    const stored = localStorage.getItem('dayout-mode') || 'light';
    setThemeMode(stored);
    applyTheme(stored);
  }, []);

  const handleThemeToggle = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('dayout-mode', next);
    applyTheme(next);
  };

  /* ── Scroll shadow ──────────────────────────────────────────────────────── */
  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, []);

  /* ── Close menu on route change ─────────────────────────────────────────── */
  useEffect(() => { setMenuOpen(false); }, [location.pathname]);

  /* ── Close menu on outside click ────────────────────────────────────────── */
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  const isActive = (path) => location.pathname === path;

  /* ── Nav links ──────────────────────────────────────────────────────────── */
  const renderLinks = () => {
    if (isAuthenticated) {
      return (
        <>
          {user?.role === 'admin' && (
            <li><Link to="/admin" className={isActive('/admin') ? 'nav-link is-active' : 'nav-link'}>Dashboard</Link></li>
          )}
          {user?.role !== 'admin' && (
            <>
              <li><Link to="/home" className={isActive('/home') ? 'nav-link is-active' : 'nav-link'}>Plan Trip</Link></li>
              <li><Link to="/past-itineraries" className={isActive('/past-itineraries') ? 'nav-link is-active' : 'nav-link'}>My Trips</Link></li>
              <li><Link to="/about" className={isActive('/about') ? 'nav-link is-active' : 'nav-link'}>About</Link></li>
              <li><Link to="/contact" className={isActive('/contact') ? 'nav-link is-active' : 'nav-link'}>Contact</Link></li>
            </>
          )}
          <li><Link to="/profile" className={isActive('/profile') ? 'nav-link is-active' : 'nav-link'}>Profile</Link></li>
          <li>
            <button type="button" className="btn btn-outline btn-sm" onClick={logout}>
              Sign Out
            </button>
          </li>
        </>
      );
    }
    return (
      <>
        <li><Link to="/about"   className={isActive('/about')   ? 'nav-link is-active' : 'nav-link'}>About</Link></li>
        <li><Link to="/contact" className={isActive('/contact') ? 'nav-link is-active' : 'nav-link'}>Contact</Link></li>
        <li><Link to="/login"   className={isActive('/login')   ? 'nav-link is-active' : 'nav-link'}>Sign In</Link></li>
        <li>
          <Link to="/register" className="btn btn-primary btn-sm">
            Get Started
          </Link>
        </li>
      </>
    );
  };

  return (
    <header className={`header${scrolled ? ' is-scrolled' : ''}`}>
      <div className="header-inner">

        {/* Logo */}
        <Link to="/" className="header-logo" aria-label="DayOut home">
          <span className="logo-icon" aria-hidden="true">✈</span>
          <span className="logo-text">DayOut</span>
        </Link>

        {/* Desktop nav */}
        <nav className="header-nav" aria-label="Main navigation">
          <ul className="nav-list">{renderLinks()}</ul>
        </nav>

        {/* Right controls */}
        <div className="header-controls">
          <button
            type="button"
            className="theme-btn"
            onClick={handleThemeToggle}
            aria-label={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            title={themeMode === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {themeMode === 'dark' ? <SunIcon /> : <MoonIcon />}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            className={`hamburger${menuOpen ? ' is-open' : ''}`}
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
          >
            <span /><span /><span />
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <div className={`mobile-menu${menuOpen ? ' is-open' : ''}`} ref={menuRef} aria-hidden={!menuOpen}>
        <nav aria-label="Mobile navigation">
          <ul className="mobile-nav-list">{renderLinks()}</ul>
        </nav>
      </div>
    </header>
  );
};

export default Header;

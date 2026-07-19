import React from 'react';
import { Link } from 'react-router-dom';
import './Footer.css';

const Footer = () => (
  <footer className="footer">
    <div className="footer-inner">
      <div className="footer-brand">
        <Link to="/" className="footer-logo">
          <span className="footer-logo-icon" aria-hidden="true">✈</span>
          <span className="footer-logo-text">DayOut</span>
        </Link>
        <p className="footer-tagline">
          Your AI-powered travel companion. Plan perfect itineraries in seconds, anywhere in the world.
        </p>
      </div>

      <div className="footer-links">
        <div className="footer-col">
          <h4>Product</h4>
          <ul>
            <li><Link to="/home">Plan a Trip</Link></li>
            <li><Link to="/past-itineraries">My Trips</Link></li>
            <li><Link to="/about">About</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Company</h4>
          <ul>
            <li><Link to="/contact">Contact</Link></li>
            <li><Link to="/about">Our Mission</Link></li>
          </ul>
        </div>
        <div className="footer-col">
          <h4>Account</h4>
          <ul>
            <li><Link to="/register">Sign Up</Link></li>
            <li><Link to="/login">Sign In</Link></li>
            <li><Link to="/profile">Profile</Link></li>
          </ul>
        </div>
      </div>
    </div>

    <div className="footer-bottom">
      <p className="footer-copy">
        © {new Date().getFullYear()} DayOut. All rights reserved.
      </p>
      <p className="footer-powered">Powered by AI</p>
    </div>
  </footer>
);

export default Footer;

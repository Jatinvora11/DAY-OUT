import React from 'react';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-content">
        <p>&copy; {new Date().getFullYear()} DayOut. All rights reserved.</p>
        <p className="footer-tagline">Plan your perfect travel itinerary with AI</p>
      </div>
    </footer>
  );
};

export default Footer;

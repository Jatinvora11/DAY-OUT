import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const Landing = () => {
  return (
    <div className="landing-container fade-in">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Welcome to DayOut</h1>
          <p className="hero-description">
            Your AI-Powered Travel Companion for Perfect Itineraries
          </p>
          <p className="hero-text">
            Plan your dream vacation with personalized travel itineraries created by advanced AI. 
            Whether you're seeking adventure, relaxation, culture, or business travel, DayOut makes 
            planning effortless and exciting.
          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-large">
              Get Started
            </Link>
            <Link to="/login" className="btn btn-secondary btn-large">
              Login
            </Link>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">Why Choose DayOut?</h2>
        <div className="features-grid">
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>AI-Powered</h3>
            <p>Advanced AI technology creates personalized itineraries tailored to your preferences</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">⚡</div>
            <h3>Fast & Easy</h3>
            <p>Generate complete travel plans in seconds with just a few clicks</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💰</div>
            <h3>Budget-Friendly</h3>
            <p>Get recommendations that match your budget and travel style</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>Worldwide Coverage</h3>
            <p>Plan trips to any destination around the globe</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📱</div>
            <h3>Save & Access</h3>
            <p>Save your itineraries and access them anytime, anywhere</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🔄</div>
            <h3>Regenerate</h3>
            <p>Not satisfied? Regenerate your itinerary until it's perfect</p>
          </div>
        </div>
      </section>

      <section className="cta-section">
        <h2>Ready to Plan Your Next Adventure?</h2>
        <p>Join DayOut today and discover the future of travel planning</p>
        <Link to="/register" className="btn btn-primary btn-large">
          Start Planning Now
        </Link>
      </section>
    </div>
  );
};

export default Landing;

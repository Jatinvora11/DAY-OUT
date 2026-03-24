import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-container fade-in">
      <div className="about-hero reveal">
        <h1 className="hero-title">About DayOut</h1>
        <p className="hero-subtitle">Your AI-Powered Travel Companion</p>
      </div>

      <div className="about-content">
        <section className="about-section reveal">
          <h2>Our Mission</h2>
          <p>
            At DayOut, we believe that planning your perfect trip should be as exciting as the journey itself. 
            Our mission is to make travel planning effortless, personalized, and inspiring by leveraging the 
            power of artificial intelligence.
          </p>
        </section>

        <section className="about-section reveal">
          <h2>What We Do</h2>
          <p>
            DayOut uses advanced AI technology to create customized travel itineraries tailored to your unique 
            preferences, budget, and travel style. Whether you're planning a leisure vacation, an adventure trip, 
            a cultural exploration, or a business journey, we've got you covered.
          </p>
        </section>

        <section className="about-section reveal">
          <h2>How It Works</h2>
          <div className="features-grid">
            <div className="feature-item">
              <div className="feature-number">1</div>
              <h3>Share Your Preferences</h3>
              <p>Tell us about your destination, dates, budget, and travel preferences.</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">2</div>
              <h3>AI Magic</h3>
              <p>Our AI analyzes thousands of options to create your perfect itinerary.</p>
            </div>
            <div className="feature-item">
              <div className="feature-number">3</div>
              <h3>Save & Go</h3>
              <p>Review, save, and access your itineraries anytime, anywhere.</p>
            </div>
          </div>
        </section>

        <section className="about-section reveal">
          <h2>Why Choose DayOut?</h2>
          <ul className="benefits-list">
            <li>✨ Personalized itineraries powered by AI</li>
            <li>⚡ Quick and easy planning process</li>
            <li>💰 Budget-conscious recommendations</li>
            <li>🌍 Support for destinations worldwide</li>
            <li>📱 Access your plans from any device</li>
            <li>🔄 Regenerate itineraries until perfect</li>
          </ul>
        </section>

        <section className="about-section cta-section reveal">
          <h2>Start Planning Your Next Adventure</h2>
          <p>Join thousands of travelers who trust DayOut for their travel planning needs.</p>
        </section>
      </div>
    </div>
  );
};

export default About;

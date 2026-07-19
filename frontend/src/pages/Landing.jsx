import React from 'react';
import { Link } from 'react-router-dom';
import './Landing.css';

const FEATURES = [
  {
    icon: '🤖',
    title: 'AI-Generated Plans',
    desc: 'Our AI crafts a personalised day-by-day itinerary based on your exact preferences, pace, and budget.'

  },
  {
    icon: '⚡',
    title: 'Ready in Seconds',
    desc: 'From destination to detailed schedule in under 30 seconds — no more hours of research.'
  },
  {
    icon: '🌍',
    title: 'Any Destination',
    desc: 'From weekend city breaks to cross-country adventures — we cover every corner of the globe.'
  },
  {
    icon: '💰',
    title: 'Budget-Smart',
    desc: 'Set your budget once. Every recommendation, restaurant, and hotel fits within it automatically.'
  },
  {
    icon: '📂',
    title: 'Save & Revisit',
    desc: 'All your itineraries are saved to your account so you can access or share them at any time.'
  },
  {
    icon: '🔁',
    title: 'Regenerate Freely',
    desc: 'Not happy with the plan? Regenerate instantly until every day looks exactly how you want.'
  }
];

const STEPS = [
  { num: '01', title: 'Tell Us Your Trip', desc: 'Pick a destination, dates, number of travellers, and your travel style.' },
  { num: '02', title: 'AI Builds Your Plan', desc: 'Our Gemini-powered engine creates a detailed itinerary with time-based activities.' },
  { num: '03', title: 'Go & Enjoy', desc: 'Save your itinerary, download a PDF, and hit the road with a perfect plan.' }
];

/* ── Floating preview card (pure CSS / JSX) ─────────────────────────────── */
const PreviewCard = () => (
  <div className="preview-card" aria-hidden="true">
    <div className="preview-card-header">
      <span className="preview-card-badge">Day 2 — Old Delhi Heritage</span>
      <span className="preview-card-date">Dec 11, 2024</span>
    </div>
    <div className="preview-timeline">
      {[
        { time: '08:30', name: 'Breakfast at Karim\'s', detail: 'Iconic Mughlai cuisine near Jama Masjid' },
        { time: '10:00', name: 'Jama Masjid', detail: 'India\'s largest mosque with panoramic views' },
        { time: '12:30', name: 'Chandni Chowk Walk', detail: 'Bustling bazaars and spice markets' },
        { time: '15:00', name: 'Red Fort', detail: 'UNESCO World Heritage Site from the 17th century' },
        { time: '19:00', name: 'Dinner at Moti Mahal', detail: 'Home of the original butter chicken' }
      ].map((item) => (
        <div key={item.time} className="preview-row">
          <span className="preview-time">{item.time}</span>
          <span className="preview-dot" />
          <div className="preview-activity">
            <strong>{item.name}</strong>
            <span>{item.detail}</span>
          </div>
        </div>
      ))}
    </div>
    <div className="preview-card-footer">
      <span className="preview-tag">🏛 Cultural</span>
      <span className="preview-tag">🍛 Foodie</span>
    </div>
  </div>
);

const Landing = () => (
  <div className="landing">

    {/* ── HERO ────────────────────────────────────────────────────────────── */}
    <section className="hero">
      <div className="hero-inner">
        <div className="hero-copy reveal">
          <span className="section-label">AI Travel Planning</span>
          <h1 className="hero-headline">
            Your next great trip,<br />
            <em>planned in seconds.</em>
          </h1>
          <p className="hero-sub">
            DayOut uses AI to build personalised, day-by-day travel itineraries — tailored to your budget, pace, and style.

          </p>
          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary btn-lg">
              Start →
            </Link>

            <Link to="/about" className="btn btn-secondary btn-lg">
              How it works
            </Link>
          </div>
          <div className="hero-trust">
            <span>✓ AI-powered</span>
            <span>✓ Any destination</span>
          </div>

        </div>

        <div className="hero-visual reveal">
          <PreviewCard />
        </div>
      </div>
    </section>

    {/* ── FEATURES ────────────────────────────────────────────────────────── */}
    <section className="features-section">
      <div className="container">
        <div className="features-header reveal">
          <span className="section-label">Why DayOut</span>
          <h2 className="section-title">Everything you need for a perfect trip</h2>
        </div>
        <div className="features-grid">
          {FEATURES.map((f) => (
            <div key={f.title} className="feature-card reveal">
              <div className="feature-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* ── HOW IT WORKS ────────────────────────────────────────────────────── */}
    <section className="how-section">
      <div className="container">
        <div className="how-header reveal">
          <span className="section-label">The Process</span>
          <h2 className="section-title">Three steps to your perfect itinerary</h2>
        </div>
        <div className="steps-row">
          {STEPS.map((s, i) => (
            <React.Fragment key={s.num}>
              <div className="step reveal">
                <div className="step-num">{s.num}</div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
              {i < STEPS.length - 1 && <div className="step-connector" aria-hidden="true" />}
            </React.Fragment>
          ))}
        </div>
      </div>
    </section>

    {/* ── CTA BAND ────────────────────────────────────────────────────────── */}
    <section className="cta-band">
      <div className="container">
        <div className="cta-inner reveal">
          <h2>Ready to plan your next adventure?</h2>
          <p>Join DayOut and discover the future of travel planning — personalised, instant, and free.</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Create your itinerary →
          </Link>
        </div>
      </div>
    </section>

  </div>
);

export default Landing;

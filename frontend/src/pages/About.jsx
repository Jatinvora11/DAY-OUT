import React from 'react';
import './About.css';

const STEPS = [
  { num: 1, title: 'Tell Us Your Preferences', desc: 'Share your destination, travel dates, number of travellers, budget, and what kind of trip you\'re after.' },
  { num: 2, title: 'AI Generates Your Plan', desc: 'Our AI analyses thousands of options and creates a detailed, day-by-day itinerary with time-based activities.' },
  { num: 3, title: 'Save, Download & Go', desc: 'Review your personalised plan, download it as a PDF, save it to your account, and hit the road.' }
];

const BENEFITS = [
  { icon: '✨', text: 'Personalised itineraries powered by advanced AI' },
  { icon: '⚡', text: 'Plans ready in under 30 seconds' },
  { icon: '💰', text: 'Budget-conscious recommendations every time' },
  { icon: '🌍', text: 'Any destination, anywhere in the world' },
  { icon: '📂', text: 'Save and access your plans from any device' },
  { icon: '🔁', text: 'Regenerate until every day is perfect' }
];

const About = () => (
  <div className="about-page fade-in">

    {/* Hero */}
    <section className="about-hero">
      <div className="container">
        <span className="section-label">About DayOut</span>
        <h1 className="about-hero-headline">Making travel planning<br />effortless and exciting.</h1>
        <p className="about-hero-sub">
          We believe the best trips start with a great plan — and the best plans shouldn't take hours to create.
        </p>
      </div>
    </section>

    {/* Mission */}
    <section className="about-section">
      <div className="container container-narrow">
        <div className="reveal">
          <span className="section-label">Our Mission</span>
          <h2 className="section-title">Travel smarter, not harder.</h2>
          <p className="about-body">
            At DayOut, we believe planning your perfect trip should be as exciting as the journey itself.
            Our mission is to make travel planning effortless, personalised, and inspiring — by harnessing
            the power of AI to create itineraries that genuinely fit your life.
          </p>
        </div>
      </div>
    </section>

    {/* How it works */}
    <section className="about-how">
      <div className="container">
        <div className="reveal" style={{ textAlign: 'center', marginBottom: 'var(--sp-12)' }}>
          <span className="section-label">How It Works</span>
          <h2 className="section-title">Three steps to your perfect plan</h2>
        </div>
        <div className="about-steps reveal">
          {STEPS.map((s) => (
            <div key={s.num} className="about-step">
              <div className="about-step-num">{s.num}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>

    {/* Benefits */}
    <section className="about-section about-benefits-section">
      <div className="container container-narrow">
        <div className="reveal" style={{ marginBottom: 'var(--sp-8)' }}>
          <span className="section-label">Why Choose DayOut</span>
          <h2 className="section-title">Built for real travellers.</h2>
        </div>
        <div className="benefits-grid reveal">
          {BENEFITS.map((b) => (
            <div key={b.text} className="benefit-item">
              <span className="benefit-icon">{b.icon}</span>
              <span>{b.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>

  </div>
);

export default About;

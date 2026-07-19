import React from 'react';
import './Contact.css';

const Contact = () => (
  <div className="contact-page fade-in">
    <section className="contact-hero">
      <div className="container">
        <span className="section-label">Get in Touch</span>
        <h1 className="contact-headline">We'd love to hear from you.</h1>
        <p className="contact-sub">
          Questions, feedback, or just want to say hi? Reach out — we usually respond within 24 hours.
        </p>
      </div>
    </section>

    <section className="contact-body">
      <div className="container container-narrow">
        <div className="contact-cards">
          <div className="contact-info-card reveal">
            <div className="contact-card-icon">📍</div>
            <h3>Headquarters</h3>
            <p>Mumbai, India</p>
          </div>
          <div className="contact-info-card reveal">
            <div className="contact-card-icon">📞</div>
            <h3>Phone</h3>
            <p>
              <a href="tel:9324815846">9324815846</a>
            </p>
          </div>
          <div className="contact-info-card reveal">
            <div className="contact-card-icon">✉️</div>
            <h3>Email</h3>
            <p>
              <a href="mailto:jatinvora11105@gmail.com">jatinvora11105@gmail.com</a>
            </p>
          </div>
        </div>
      </div>
    </section>
  </div>
);

export default Contact;

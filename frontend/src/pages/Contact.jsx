import React from 'react';
import './Contact.css';

const Contact = () => {
  return (
    <div className="contact-container fade-in">
      <div className="contact-card reveal">
        <h2 className="contact-title">Contact Us</h2>

        <div className="contact-info">
          <h3>Our Locations</h3>
          <div className="info-item">
            <strong>Headquarters:</strong> Mumbai, India
          </div>
          <div className="info-item">
            <strong>Phone:</strong> 9324815846
          </div>
          <div className="info-item">
            <strong>Email:</strong> jatinvora11105@gmail.com
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;

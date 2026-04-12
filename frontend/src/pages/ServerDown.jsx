import React from 'react';
import './ServerDown.css';

const ServerDown = ({ onRetry }) => {
  return (
    <div className="server-down">
      <div className="server-down-card">
        <div className="server-down-badge">Service Unavailable</div>
        <h1>We are having trouble connecting.</h1>
        <p>
          The server is not responding right now. Please try again in a moment.
        </p>
        <button type="button" className="btn btn-primary" onClick={onRetry}>
          Try Again
        </button>
      </div>
    </div>
  );
};

export default ServerDown;

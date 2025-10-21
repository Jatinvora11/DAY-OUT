import React, { useEffect, useState } from 'react';
import { itineraryAPI } from '../utils/api.js';
import './PastItineraries.css';

const PastItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchItineraries();
  }, []);

  const fetchItineraries = async () => {
    try {
      const response = await itineraryAPI.getUserItineraries();
      setItineraries(response.data);
    } catch (err) {
      setError('Failed to load itineraries');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this itinerary?')) {
      return;
    }

    try {
      await itineraryAPI.delete(id);
      setItineraries(itineraries.filter(item => item._id !== id));
    } catch (err) {
      alert('Failed to delete itinerary');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <div className="past-itineraries-container fade-in">
      <div className="itineraries-header">
        <h2 className="section-title">Past Itineraries</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {itineraries.length === 0 ? (
        <div className="empty-state">
          <p>No past itineraries found.</p>
          <p>Start planning your next adventure!</p>
        </div>
      ) : (
        <div className="itineraries-list">
          {itineraries.map((itinerary, index) => (
            <div key={itinerary._id} className="itinerary-item slide-in" style={{animationDelay: `${index * 0.1}s`}}>
              <div className="itinerary-header-info">
                <h3 className="itinerary-location">{itinerary.location}</h3>
                <span className="itinerary-dates">
                  {new Date(itinerary.startDate).toLocaleDateString()} - {new Date(itinerary.endDate).toLocaleDateString()}
                </span>
              </div>
              
              <div className="itinerary-meta">
                <span className="meta-item">
                  <strong>Adults:</strong> {itinerary.adults}
                </span>
                <span className="meta-item">
                  <strong>Children:</strong> {itinerary.children}
                </span>
                <span className="meta-item">
                  <strong>Budget:</strong> ₹{itinerary.budget}
                </span>
                <span className="meta-item">
                  <strong>Type:</strong> {itinerary.tripType}
                </span>
              </div>

              <div className="itinerary-text">
                {itinerary.itineraryText.split('\n').slice(0, 5).map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
                {itinerary.itineraryText.split('\n').length > 5 && <p>...</p>}
              </div>

              <div className="itinerary-footer">
                <span className="saved-date">
                  Saved on {new Date(itinerary.createdAt).toLocaleDateString()}
                </span>
                <button 
                  onClick={() => handleDelete(itinerary._id)} 
                  className="btn-delete"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastItineraries;

import React, { useEffect, useState } from 'react';
import { itineraryAPI } from '../utils/api.js';
import { openItineraryPdf } from '../utils/pdf.js';
import './PastItineraries.css';

const PastItineraries = () => {
  const [itineraries, setItineraries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedId, setExpandedId] = useState(null);

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

  const handleToggleExpand = (id) => {
    setExpandedId((current) => (current === id ? null : id));
  };

  const handleDownloadPdf = (itinerary) => {
    openItineraryPdf({
      title: `DayOut Itinerary - ${itinerary.location || 'Your Trip'}`,
      subtitle: itinerary.startDate && itinerary.endDate
        ? `${new Date(itinerary.startDate).toLocaleDateString()} - ${new Date(itinerary.endDate).toLocaleDateString()}`
        : '',
      meta: [
        { label: 'Adults', value: itinerary.adults },
        { label: 'Children', value: itinerary.children },
        {
          label: 'Budget',
          value: `INR ${itinerary.budget} (${itinerary.budgetType === 'per_person' ? 'per person' : 'overall'})`
        },
        { label: 'Trip Type', value: itinerary.tripType }
      ],
      lines: itinerary.itineraryText.split('\n')
    });
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
      <div className="itineraries-header reveal">
        <h2 className="section-title">Past Itineraries</h2>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {itineraries.length === 0 ? (
        <div className="empty-state reveal">
          <p>No past itineraries found.</p>
          <p>Start planning your next adventure!</p>
        </div>
      ) : (
        <div className="itineraries-list">
          {itineraries.map((itinerary, index) => (
            <div
              key={itinerary._id}
              className="itinerary-item reveal"
              style={{ transitionDelay: `${index * 80}ms` }}
            >
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
                  <strong>Budget:</strong> ₹{itinerary.budget} ({itinerary.budgetType === 'per_person' ? 'per person' : 'overall'})
                </span>
                <span className="meta-item">
                  <strong>Type:</strong> {itinerary.tripType}
                </span>
              </div>

              <div className={`itinerary-text ${expandedId === itinerary._id ? 'is-expanded' : 'is-collapsed'}`}>
                {itinerary.itineraryText.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>

              <div className="itinerary-footer">
                <span className="saved-date">
                  Saved on {new Date(itinerary.createdAt).toLocaleDateString()}
                </span>
                <div className="itinerary-footer-actions">
                  <button
                    type="button"
                    onClick={() => handleToggleExpand(itinerary._id)}
                    className="btn btn-secondary btn-compact"
                    aria-expanded={expandedId === itinerary._id}
                  >
                    {expandedId === itinerary._id ? 'Show Less' : 'Show More'}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDownloadPdf(itinerary)}
                    className="btn btn-secondary btn-compact"
                  >
                    Download PDF
                  </button>
                  <button 
                    onClick={() => handleDelete(itinerary._id)} 
                    className="btn-delete"
                    type="button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PastItineraries;

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
      <div className="past-itineraries-page fade-in">
        <div style={{ display: 'flex', justifyContent: 'center', padding: 'var(--sp-16)' }}>
          <div className="spinner" />
        </div>
      </div>
    );
  }

  return (
    <div className="past-itineraries-page fade-in">
      <div className="past-page-header">
        <div>
          <h1>My Trips</h1>
          <p>{itineraries.length} saved {itineraries.length === 1 ? 'itinerary' : 'itineraries'}</p>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {itineraries.length === 0 ? (
        <div className="empty-state reveal">
          <div className="empty-state-icon">🗺️</div>
          <h3>No trips saved yet</h3>
          <p>Generate your first itinerary and save it to see it here.</p>
          <a href="/home" className="btn btn-primary">Plan a trip →</a>
        </div>
      ) : (
        <div className="itineraries-grid">
          {itineraries.map((itinerary, index) => (
            <div
              key={itinerary._id}
              className="itinerary-card reveal"
              style={{ transitionDelay: `${index * 60}ms` }}
            >
              {/* Card header */}
              <div className="icard-header">
                <div className="icard-dest">{itinerary.location}</div>
                <div className="icard-dates">
                  📅 {new Date(itinerary.startDate).toLocaleDateString('en-GB')} — {new Date(itinerary.endDate).toLocaleDateString('en-GB')}
                </div>
                <div className="icard-saved">
                  Saved {new Date(itinerary.createdAt).toLocaleDateString('en-GB')}
                </div>
              </div>

              {/* Meta badges */}
              <div className="icard-body">
                <div className="icard-meta">
                  <span className="icard-meta-badge">👤 {itinerary.adults} adults</span>
                  {itinerary.children > 0 && (
                    <span className="icard-meta-badge">🧒 {itinerary.children} children</span>
                  )}
                  <span className="icard-meta-badge">💰 ₹{itinerary.budget} {itinerary.budgetType === 'per_person' ? '/person' : ' total'}</span>
                  {itinerary.tripType && (
                    <span className="icard-meta-badge">🧭 {itinerary.tripType}</span>
                  )}
                </div>
              </div>

              {/* Expanded content */}
              {expandedId === itinerary._id && (
                <div className="icard-expanded">
                  {itinerary.itineraryText.split('\n').map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              )}

              {/* Footer actions */}
              <div className="icard-footer">
                <button type="button" onClick={() => handleToggleExpand(itinerary._id)}
                  className="btn btn-secondary btn-sm" aria-expanded={expandedId === itinerary._id}>
                  {expandedId === itinerary._id ? 'Show less' : 'View plan'}
                </button>
                <button type="button" onClick={() => handleDownloadPdf(itinerary)}
                  className="btn btn-secondary btn-sm">
                  ↓ PDF
                </button>
                <button type="button" onClick={() => handleDelete(itinerary._id)}
                  className="btn btn-danger btn-sm">
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


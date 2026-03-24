import React, { useState } from 'react';
import { itineraryAPI } from '../utils/api.js';
import './Home.css';

const Home = () => {
  const [formData, setFormData] = useState({
    location: '',
    startDate: '',
    endDate: '',
    adults: 1,
    children: 0,
    budget: 0,
    tripType: 'leisure',
    specialRequests: ''
  });
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleGenerate = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    setItinerary(null);

    try {
      const response = await itineraryAPI.generate(formData);
      setItinerary(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to generate itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!itinerary) return;

    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const saveData = {
        ...formData,
        itineraryText: itinerary.itinerary
      };
      await itineraryAPI.save(saveData);
      setSuccess('Itinerary saved successfully!');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container fade-in">
      <div className="itinerary-card reveal">
        <h2 className="itinerary-title">Plan Your DayOut</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleGenerate} className="itinerary-form">
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="location">Location:</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                className="form-input"
                disabled={loading}
                placeholder="e.g., Paris, France"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="startDate">Start Date:</label>
              <input
                type="date"
                id="startDate"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="endDate">End Date:</label>
              <input
                type="date"
                id="endDate"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="adults">Number of Adults:</label>
              <input
                type="number"
                id="adults"
                name="adults"
                value={formData.adults}
                onChange={handleChange}
                min="1"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="children">Number of Children:</label>
              <input
                type="number"
                id="children"
                name="children"
                value={formData.children}
                onChange={handleChange}
                min="0"
                required
                className="form-input"
                disabled={loading}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="budget">Average Budget (INR):</label>
              <input
                type="number"
                id="budget"
                name="budget"
                value={formData.budget}
                onChange={handleChange}
                min="0"
                required
                className="form-input"
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tripType">Kind of Trip:</label>
              <select
                id="tripType"
                name="tripType"
                value={formData.tripType}
                onChange={handleChange}
                required
                className="form-input"
                disabled={loading}
              >
                <option value="leisure">Leisure</option>
                <option value="adventure">Adventure</option>
                <option value="cultural">Cultural</option>
                <option value="business">Business</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="specialRequests">Special Requests:</label>
            <textarea
              id="specialRequests"
              name="specialRequests"
              value={formData.specialRequests}
              onChange={handleChange}
              className="form-textarea"
              disabled={loading}
              placeholder="Any dietary restrictions, accessibility needs, or preferences..."
            />
          </div>

          <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
            {loading ? 'Generating...' : 'Generate Itinerary'}
          </button>
        </form>

        {loading && !itinerary && (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Creating your perfect itinerary...</p>
          </div>
        )}

        {itinerary && (
          <div className="itinerary-results slide-in">
            <h2 className="result-title">Your Itinerary</h2>
            <div className="itinerary-content">
              {itinerary.itinerary.split('\n').map((line, index) => (
                <p key={index}>{line}</p>
              ))}
            </div>
            
            <div className="itinerary-actions">
              <button onClick={handleGenerate} className="btn btn-secondary" disabled={loading}>
                Regenerate Itinerary
              </button>
              <button onClick={handleSave} className="btn btn-primary" disabled={loading}>
                {loading ? 'Saving...' : 'Save Itinerary'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;

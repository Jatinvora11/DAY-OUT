import React, { useEffect, useMemo, useState } from 'react';
import { itineraryAPI } from '../utils/api.js';
import { openItineraryPdf } from '../utils/pdf.js';
import './Home.css';

const TRIP_STYLES = [
  'leisure',
  'adventure',
  'cultural',
  'business',
  'foodie',
  'wellness',
  'nature',
  'nightlife',
  'family',
  'romantic'
];

const TRAVEL_PACES = [
  { value: 'relaxed', label: 'Relaxed' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'packed', label: 'Packed' }
];

const ACCOMMODATION_TYPES = [
  { value: 'hostel', label: 'Hostel' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'resort', label: 'Resort' },
  { value: 'airbnb', label: 'Airbnb' }
];

const LOADING_STEPS = [
  'Researching destination',
  'Building schedule',
  'Adding restaurants',
  'Balancing travel pace',
  'Finalizing itinerary'
];

const parseStructuredItinerary = (text) => {
  const raw = (text || '').replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  // ── Description ──────────────────────────────────────────────────────────
  const descMatch = raw.match(/\[DESCRIPTION\]([\s\S]*?)\[\/DESCRIPTION\]/i);
  const description = descMatch ? descMatch[1].trim() : '';

  // ── Days ─────────────────────────────────────────────────────────────────
  const dayRegex = /\[DAY\s+(\d+)\s*\|\s*([^|\]]+)\s*\|\s*([^\]]+)\]([\s\S]*?)\[\/DAY\]/gi;
  const days = [];
  let dayMatch;
  while ((dayMatch = dayRegex.exec(raw)) !== null) {
    const dayNumber = parseInt(dayMatch[1], 10);
    const date = dayMatch[2].trim();
    const theme = dayMatch[3].trim();
    const body = dayMatch[4];

    const activityRegex = /^(\d{1,2}:\d{2})\s*\|\s*(.+?)(?:\s+[\u2014\u2013]\s+(.+))?$/gm;
    const items = [];
    let actMatch;
    while ((actMatch = activityRegex.exec(body)) !== null) {
      const time = actMatch[1].trim();
      const name = actMatch[2].trim();
      // detail comes after an em-dash or en-dash WITH spaces on both sides
      let detail = actMatch[3] ? actMatch[3].trim() : '';
      // Also handle the case where Gemini puts the dash inline inside group 2
      // Only split on em/en-dash surrounded by spaces to avoid splitting "Check-in" etc.
      const emDashSplit = name.split(/\s+[\u2014\u2013]\s+/);
      const activityName = emDashSplit[0].trim();
      if (!detail && emDashSplit.length > 1) {
        detail = emDashSplit.slice(1).join(' \u2014 ').trim();
      }
      items.push({ time, name: activityName, detail });
    }
    days.push({ dayNumber, date, theme, items });
  }

  // ── Travel & Accommodation ────────────────────────────────────────────────
  const taMatch = raw.match(/\[TRAVEL_AND_ACCOMMODATION\]([\s\S]*?)\[\/TRAVEL_AND_ACCOMMODATION\]/i);
  const travelRaw = taMatch ? taMatch[1].trim() : '';
  const travelItems = travelRaw
    .split('\n')
    .map((l) => l.replace(/^\s*[-•*]\s*/, '').trim())
    .filter(Boolean);

  return { description, days, travelItems };
};


const Home = () => {
  const [formData, setFormData] = useState({
    location: '',
    startDate: '',
    endDate: '',
    adults: 1,
    children: 0,
    budgetType: 'overall',
    budget: 0,
    travelPace: 'moderate',
    accommodationType: 'hotel',
    tripStyles: ['leisure'],
    mustSee: [],
    specialRequests: ''
  });
  const [mustSeeInput, setMustSeeInput] = useState('');
  const [activeStep, setActiveStep] = useState(0);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [collapsedDays, setCollapsedDays] = useState({});
  const [itinerary, setItinerary] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loadingStep, setLoadingStep] = useState(0);

  const parsed = useMemo(() => {
    if (!itinerary?.itinerary) return { description: '', days: [], travelItems: [] };
    return parseStructuredItinerary(itinerary.itinerary);
  }, [itinerary]);

  // Build flat tab list: [Overview (if desc), Day 1, Day 2, ..., Travel & Accommodation]
  const tabs = useMemo(() => {
    const list = [];
    if (parsed.description) list.push({ type: 'overview', label: 'Overview' });
    parsed.days.forEach((d) => list.push({ type: 'day', label: `Day ${d.dayNumber}`, data: d }));
    if (parsed.travelItems.length > 0) list.push({ type: 'travel', label: 'Travel & Stay' });
    return list;
  }, [parsed]);


  useEffect(() => {
    if (!loading) return undefined;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % LOADING_STEPS.length);
    }, 1600);
    return () => clearInterval(interval);
  }, [loading]);

  useEffect(() => {
    if (!tabs.length) return;
    setActiveDayIndex(0);
    setCollapsedDays({});
  }, [tabs.length]);

  useEffect(() => {
    if (!tabs.length) return;
    const target = document.getElementById(`day-${activeDayIndex}`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [activeDayIndex, tabs.length]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleBudgetTypeChange = (budgetType) => {
    setFormData((prev) => ({
      ...prev,
      budgetType
    }));
  };

  const handleTripStyleToggle = (style) => {
    setFormData((prev) => {
      const selected = new Set(prev.tripStyles);
      if (selected.has(style)) {
        selected.delete(style);
      } else {
        if (selected.size >= 2) {
          return prev;
        }
        selected.add(style);
      }
      return { ...prev, tripStyles: Array.from(selected) };
    });
  };

  const addMustSeeTag = (value) => {
    const cleaned = value.trim();
    if (!cleaned) return;
    setFormData((prev) => {
      if (prev.mustSee.includes(cleaned)) return prev;
      return { ...prev, mustSee: [...prev.mustSee, cleaned] };
    });
    setMustSeeInput('');
  };

  const handleMustSeeKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ',') {
      event.preventDefault();
      addMustSeeTag(mustSeeInput);
    }
  };

  const handleMustSeeBlur = () => {
    addMustSeeTag(mustSeeInput);
  };

  const handleRemoveMustSee = (tag) => {
    setFormData((prev) => ({
      ...prev,
      mustSee: prev.mustSee.filter((item) => item !== tag)
    }));
  };

  const handleDateClick = (event) => {
    if (typeof event.target.showPicker === 'function') {
      event.target.showPicker();
    }
  };

  const handleGenerate = async () => {
    if (activeStep < steps.length - 1) return;
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
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save itinerary. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPdf = () => {
    if (!itinerary) return;

    openItineraryPdf({
      title: `DayOut Itinerary - ${formData.location || 'Your Trip'}`,
      subtitle: formData.startDate && formData.endDate
        ? `${formData.startDate} - ${formData.endDate}`
        : '',
      meta: [
        { label: 'Adults', value: formData.adults },
        { label: 'Children', value: formData.children },
        {
          label: 'Budget',
          value: `INR ${formData.budget} (${formData.budgetType === 'per_person' ? 'per person' : 'overall'})`
        },
        { label: 'Travel Pace', value: formData.travelPace },
        { label: 'Accommodation', value: formData.accommodationType },
        { label: 'Trip Styles', value: formData.tripStyles.join(', ') || 'Not selected' },
        { label: 'Must-See', value: formData.mustSee.join(', ') || 'None' }
      ],
      lines: itinerary.itinerary.split('\n'),
      sections: tabs
        .filter((t) => t.type === 'day')
        .map((t) => ({
          title: `Day ${t.data.dayNumber} — ${t.data.theme}`,
          items: t.data.items.map((item) => ({
            time: item.time,
            text: item.detail ? `${item.name} — ${item.detail}` : item.name
          }))
        }))
    });
  };

  const steps = ['Where & When', "Who's Coming", 'Preferences'];
  const canProceedToNext = () => {
    if (activeStep === 0) {
      return formData.location && formData.startDate && formData.endDate;
    }
    if (activeStep === 1) {
      return Number(formData.adults) >= 1 && Number(formData.children) >= 0;
    }
    return true;
  };

  const handleNextStep = () => {
    if (!canProceedToNext()) return;
    setActiveStep((prev) => Math.min(prev + 1, steps.length - 1));
  };

  const handlePrevStep = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleToggleDayCollapse = (index) => {
    setCollapsedDays((prev) => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleFormKeyDown = (event) => {
    if (event.key !== 'Enter') return;
    if (event.target?.tagName === 'TEXTAREA') return;
    if (event.target?.tagName === 'BUTTON') return;
    event.preventDefault();
  };

  const handleFormSubmit = (event) => {
    event.preventDefault();
  };

  const handleGenerateClick = (event) => {
    const form = event.currentTarget.form;
    if (form && !form.checkValidity()) {
      form.reportValidity();
      return;
    }
    handleGenerate();
  };

  return (
    <div className="home-container fade-in">
      <div className="itinerary-card reveal">
        <h2 className="itinerary-title">Plan Your DayOut</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <form onSubmit={handleFormSubmit} onKeyDown={handleFormKeyDown} className="itinerary-form">
          <div className="wizard-steps" role="tablist" aria-label="Trip planner steps">
            {steps.map((step, index) => (
              <button
                type="button"
                key={step}
                className={`wizard-step ${activeStep === index ? 'is-active' : ''}`}
                onClick={() => setActiveStep(index)}
                aria-current={activeStep === index}
              >
                <span className="wizard-step-count">{index + 1}</span>
                <span className="wizard-step-label">{step}</span>
              </button>
            ))}
          </div>

          {activeStep === 0 && (
            <div className="wizard-panel">
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
                    onClick={handleDateClick}
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
                    onClick={handleDateClick}
                    required
                    className="form-input"
                    disabled={loading}
                  />
                </div>
              </div>
            </div>
          )}

          {activeStep === 1 && (
            <div className="wizard-panel">
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
                  <label htmlFor="accommodationType">Accommodation Type:</label>
                  <select
                    id="accommodationType"
                    name="accommodationType"
                    value={formData.accommodationType}
                    onChange={handleChange}
                    required
                    className="form-input"
                    disabled={loading}
                  >
                    {ACCOMMODATION_TYPES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeStep === 2 && (
            <div className="wizard-panel">
              <div className="form-row">
                <div className="form-group">
                  <label>Budget Type:</label>
                  <div className="budget-tabs" role="tablist" aria-label="Budget type">
                    <button
                      type="button"
                      className={`budget-tab ${formData.budgetType === 'overall' ? 'is-active' : ''}`}
                      onClick={() => handleBudgetTypeChange('overall')}
                      disabled={loading}
                      role="tab"
                      aria-selected={formData.budgetType === 'overall'}
                    >
                      Overall
                    </button>
                    <button
                      type="button"
                      className={`budget-tab ${formData.budgetType === 'per_person' ? 'is-active' : ''}`}
                      onClick={() => handleBudgetTypeChange('per_person')}
                      disabled={loading}
                      role="tab"
                      aria-selected={formData.budgetType === 'per_person'}
                    >
                      Per Person
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="budget">Budget Amount (INR):</label>
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
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="travelPace">Travel Pace:</label>
                  <select
                    id="travelPace"
                    name="travelPace"
                    value={formData.travelPace}
                    onChange={handleChange}
                    required
                    className="form-input"
                    disabled={loading}
                  >
                    {TRAVEL_PACES.map((pace) => (
                      <option key={pace.value} value={pace.value}>
                        {pace.label}
                      </option>
                    ))}
                  </select>
                  <p className="helper-text">Relaxed = fewer activities, Packed = full days.</p>
                </div>
              </div>

              <div className="form-group">
                <label>Trip Styles (pick up to 2):</label>
                <div className="trip-style-grid" role="group" aria-label="Trip styles">
                  {TRIP_STYLES.map((style) => (
                    <button
                      type="button"
                      key={style}
                      className={`trip-style-pill ${formData.tripStyles.includes(style) ? 'is-active' : ''}`}
                      onClick={() => handleTripStyleToggle(style)}
                      disabled={loading}
                    >
                      {style}
                    </button>
                  ))}
                </div>
                <p className="helper-text">Choose up to two styles for a balanced plan.</p>
              </div>

              <div className="form-group">
                <label htmlFor="mustSee">Must-See Attractions:</label>
                <div className="tag-input">
                  {formData.mustSee.map((tag) => (
                    <span key={tag} className="tag-chip">
                      {tag}
                      <button
                        type="button"
                        className="tag-remove"
                        onClick={() => handleRemoveMustSee(tag)}
                        aria-label={`Remove ${tag}`}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    type="text"
                    id="mustSee"
                    name="mustSee"
                    value={mustSeeInput}
                    onChange={(event) => setMustSeeInput(event.target.value)}
                    onKeyDown={handleMustSeeKeyDown}
                    onBlur={handleMustSeeBlur}
                    placeholder="Add landmark and press Enter"
                    className="tag-input-field"
                    disabled={loading}
                  />
                </div>
                <p className="helper-text">We will lock these into the itinerary.</p>
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
                  placeholder="Dietary restrictions, accessibility needs, or preferences..."
                />
              </div>
            </div>
          )}

          <div className="wizard-actions">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handlePrevStep}
              disabled={loading || activeStep === 0}
            >
              Back
            </button>
            {activeStep < steps.length - 1 ? (
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleNextStep}
                disabled={loading || !canProceedToNext()}
              >
                Next
              </button>
            ) : (
              <button
                type="button"
                className="btn btn-primary btn-full"
                disabled={loading}
                onClick={handleGenerateClick}
              >
                {loading ? 'Generating...' : 'Generate Itinerary'}
              </button>
            )}
          </div>
        </form>

        {loading && !itinerary && (
          <div className="loading-container">
            <div className="loading-circle"></div>
            <p className="loading-text">{LOADING_STEPS[loadingStep]}</p>
          </div>
        )}

        {itinerary && (
          <div className="itinerary-results slide-in">
            <h2 className="result-title">Your Itinerary</h2>

            {/* Tab navigation */}
            {tabs.length > 0 && (
              <div className="day-tabs" role="tablist" aria-label="Itinerary sections">
                {tabs.map((tab, index) => (
                  <button
                    type="button"
                    key={tab.label}
                    className={`day-tab ${activeDayIndex === index ? 'is-active' : ''}`}
                    onClick={() => setActiveDayIndex(index)}
                    role="tab"
                    aria-selected={activeDayIndex === index}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Active section content */}
            {tabs[activeDayIndex] && (
              <section className="day-block" id={`day-${activeDayIndex}`}>
                {/* ── Overview / Description ── */}
                {tabs[activeDayIndex].type === 'overview' && (
                  <>
                    <div className="day-header is-static">
                      <div>
                        <h3>Trip Overview</h3>
                        <p>Your journey at a glance</p>
                      </div>
                    </div>
                    <div className="itinerary-description">
                      <p>{parsed.description}</p>
                    </div>
                  </>
                )}

                {/* ── Day timeline ── */}
                {tabs[activeDayIndex].type === 'day' && (() => {
                  const day = tabs[activeDayIndex].data;
                  return (
                    <>
                      <div className="day-header is-static">
                        <div>
                          <h3>Day {day.dayNumber} — {day.theme}</h3>
                          <p>{day.date} &nbsp;·&nbsp; {day.items.length} stops</p>
                        </div>
                      </div>
                      <div className="timeline">
                        {day.items.map((item, i) => (
                          <div key={i} className="timeline-item">
                            <div className="timeline-time">{item.time}</div>
                            <div className="timeline-dot" />
                            <div className="timeline-activity">
                              <span className="timeline-activity-name">{item.name}</span>
                              {item.detail && (
                                <span className="timeline-activity-detail">{item.detail}</span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </>
                  );
                })()}

                {/* ── Travel & Accommodation ── */}
                {tabs[activeDayIndex].type === 'travel' && (
                  <>
                    <div className="day-header is-static">
                      <div>
                        <h3>Travel &amp; Accommodation</h3>
                        <p>Practical tips for your trip</p>
                      </div>
                    </div>
                    <div className="travel-card">
                      <ul className="travel-list">
                        {parsed.travelItems.map((tip, i) => (
                          <li key={i} className="travel-list-item">
                            <span className="travel-bullet">✈</span>
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </>
                )}
              </section>
            )}

            <div className="itinerary-actions">
              <button onClick={handleGenerate} className="btn btn-secondary" disabled={loading}>
                Regenerate Itinerary
              </button>
              <button onClick={handleDownloadPdf} className="btn btn-secondary" disabled={loading}>
                Download PDF
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

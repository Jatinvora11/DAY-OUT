import React, { useEffect, useState } from 'react';
import { adminAPI } from '../utils/api.js';
import './AdminDashboard.css';
import './PastItineraries.css';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState(null);
  const [details, setDetails] = useState(null);
  const [expandedItineraryId, setExpandedItineraryId] = useState(null);
  const [globalUsage, setGlobalUsage] = useState(null);
  const [userUsage, setUserUsage] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [loadingUsage, setLoadingUsage] = useState(false);
  const [error, setError] = useState('');

  const loadUsers = async () => {
    setLoadingUsers(true);
    setError('');

    try {
      const response = await adminAPI.getUsers();
      setUsers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load users.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadUserDetails = async (userId) => {
    setLoadingDetails(true);
    setError('');

    try {
      const response = await adminAPI.getUserDetails(userId);
      setDetails(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load user details.');
    } finally {
      setLoadingDetails(false);
    }
  };

  const loadUsage = async () => {
    setLoadingUsage(true);
    setError('');

    try {
      const [globalResponse, userResponse] = await Promise.all([
        adminAPI.getGlobalUsage(),
        adminAPI.getUserUsage()
      ]);
      setGlobalUsage(globalResponse.data);
      setUserUsage(userResponse.data.users || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load usage data.');
    } finally {
      setLoadingUsage(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadUsage();
  }, []);

  const handleSelectUser = (userId) => {
    setSelectedUserId(userId);
    loadUserDetails(userId);
    setExpandedItineraryId(null);
  };

  const handleToggleExpand = (id) => {
    setExpandedItineraryId((current) => (current === id ? null : id));
  };

  return (
    <div className="admin-page">
      <div className="admin-header">
        <div>
          <h2>Admin Dashboard</h2>
          <p className="admin-subtitle">Manage users, review itineraries, and track API usage.</p>
        </div>
        <div className="admin-actions">
          <button type="button" className="btn btn-secondary" onClick={loadUsage} disabled={loadingUsage}>
            {loadingUsage ? 'Refreshing...' : 'Refresh Usage'}
          </button>
          <button type="button" className="btn btn-secondary" onClick={loadUsers} disabled={loadingUsers}>
            {loadingUsers ? 'Refreshing...' : 'Refresh Users'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <section className="admin-panel admin-usage">
        <div className="admin-usage-header">
          <h3>Usage Overview</h3>
          {globalUsage && (
            <span className="admin-usage-window">
              Window start: {new Date(globalUsage.window.minuteStart).toLocaleTimeString()} / {new Date(globalUsage.window.dayStart).toLocaleDateString('en-GB')}
            </span>
          )}
        </div>

        {loadingUsage && <div className="admin-empty">Loading usage...</div>}

        {!loadingUsage && globalUsage && (
          <div className="admin-usage-grid">
            <div className="admin-usage-card">
              <h4>Global Minute</h4>
              <p>{globalUsage.usage.minute.requests} / {globalUsage.limits.global.rpm} RPM</p>
              <p>{globalUsage.usage.minute.tokens} / {globalUsage.limits.global.tpm} TPM</p>
            </div>
            <div className="admin-usage-card">
              <h4>Global Day</h4>
              <p>{globalUsage.usage.day.requests} / {globalUsage.limits.global.rpd} RPD</p>
              <p>{globalUsage.usage.day.tokens} tokens</p>
            </div>
            <div className="admin-usage-card">
              <h4>User Limits</h4>
              <p>{globalUsage.limits.user.rpm} RPM</p>
              <p>{globalUsage.limits.user.tpm} TPM</p>
              <p>{globalUsage.limits.user.rpd} RPD</p>
            </div>
          </div>
        )}

        {!loadingUsage && globalUsage && (
          <div className="admin-usage-table">
            <div className="admin-usage-row admin-usage-head">
              <span>User</span>
              <span>Minute</span>
              <span>Day</span>
            </div>
            {userUsage.length ? (
              userUsage.map((entry) => (
                <div className="admin-usage-row" key={entry.user._id}>
                  <div>
                    <strong>{entry.user.username}</strong>
                    <span className="admin-usage-sub">{entry.user.email}</span>
                  </div>
                  <div>
                    <span>{entry.minute.requests} req</span>
                    <span className="admin-usage-sub">{entry.minute.tokens} tok</span>
                  </div>
                  <div>
                    <span>{entry.day.requests} req</span>
                    <span className="admin-usage-sub">{entry.day.tokens} tok</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="admin-empty">No user usage yet.</div>
            )}
          </div>
        )}
      </section>

      <div className="admin-layout">
        <section className="admin-panel">
          <h3>Users</h3>
          {loadingUsers ? (
            <div className="admin-empty">Loading users...</div>
          ) : (
            <ul className="admin-user-list">
              {users.map((user) => (
                <li key={user._id}>
                  <button
                    type="button"
                    className={`admin-user-card ${selectedUserId === user._id ? 'is-active' : ''}`}
                    onClick={() => handleSelectUser(user._id)}
                  >
                    <div className="admin-user-name">{user.username}</div>
                    <div className="admin-user-meta">
                      <span className="admin-user-email">{user.email}</span>
                      <span className={`admin-role ${user.role}`}>{user.role}</span>
                    </div>
                  </button>
                </li>
              ))}
              {!users.length && <li className="admin-empty">No users found.</li>}
            </ul>
          )}
        </section>

        <section className="admin-panel">
          <h3>User Details</h3>
          {!selectedUserId && <div className="admin-empty">Select a user to view details.</div>}

          {selectedUserId && loadingDetails && (
            <div className="admin-empty">Loading details...</div>
          )}

          {selectedUserId && details && !loadingDetails && (
            <div className="admin-details">
              <div className="admin-user-info">
                <div>
                  <span className="label">Username</span>
                  <strong>{details.user.username}</strong>
                </div>
                <div>
                  <span className="label">Email</span>
                  <strong>{details.user.email}</strong>
                </div>
                <div>
                  <span className="label">Role</span>
                  <strong className={`admin-role ${details.user.role}`}>{details.user.role}</strong>
                </div>
                <div>
                  <span className="label">Account Type</span>
                  <strong>{details.user.accountType}</strong>
                </div>
              </div>

              {details.user.role !== 'admin' && (
                <div className="admin-itineraries">
                  <h4>Saved Itineraries</h4>
                  {details.itineraries.length ? (
                    <div className="itineraries-list">
                      {details.itineraries.map((itinerary, index) => (
                        <div
                          key={itinerary._id}
                          className="itinerary-item"
                          style={{ transitionDelay: `${index * 60}ms` }}
                        >
                          <div className="itinerary-header-info">
                            <h3 className="itinerary-location">{itinerary.location}</h3>
                            <span className="itinerary-dates">
                              {new Date(itinerary.startDate).toLocaleDateString('en-GB')} - {new Date(itinerary.endDate).toLocaleDateString('en-GB')}
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

                          <div className={`itinerary-text ${expandedItineraryId === itinerary._id ? 'is-expanded' : 'is-collapsed'}`}>
                            {itinerary.itineraryText.split('\n').map((line, i) => (
                              <p key={i}>{line}</p>
                            ))}
                          </div>

                          <div className="itinerary-footer">
                            <span className="saved-date">
                              Saved on {new Date(itinerary.createdAt).toLocaleDateString('en-GB')}
                            </span>
                            <div className="itinerary-footer-actions">
                              <button
                                type="button"
                                onClick={() => handleToggleExpand(itinerary._id)}
                                className="btn btn-secondary btn-compact"
                                aria-expanded={expandedItineraryId === itinerary._id}
                              >
                                {expandedItineraryId === itinerary._id ? 'Show Less' : 'View Full'}
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-empty">No itineraries saved for this user.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;

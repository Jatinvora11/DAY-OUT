import React, { useEffect, useState } from 'react';
import { adminAPI } from '../utils/api.js';
import './AdminDashboard.css';

/* ── Tiny bar chart using pure CSS ─────────────────────────────────────────── */
const BarChart = ({ value, max, label }) => {
  const pct = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  const color = pct > 80 ? '#DC2626' : pct > 50 ? '#D4963A' : '#059669';
  return (
    <div className="bar-chart-row">
      <div className="bar-chart-label">{label}</div>
      <div className="bar-chart-track">
        <div className="bar-chart-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
      <div className="bar-chart-value">{value}<span>/{max}</span></div>
    </div>
  );
};

const StatCard = ({ label, value, sub, accent }) => (
  <div className={`stat-card${accent ? ' stat-card--accent' : ''}`}>
    <div className="stat-card-label">{label}</div>
    <div className="stat-card-value">{value}</div>
    {sub && <div className="stat-card-sub">{sub}</div>}
  </div>
);

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

  const totalUsers = users.filter(u => u.role !== 'admin').length;
  const totalItineraries = userUsage.reduce((sum, u) => sum + (u.day?.requests || 0), 0);

  return (
    <div className="admin-page">

      {/* ── Page header ──────────────────────────────────────────────────── */}
      <div className="admin-topbar">
        <div>
          <h1 className="admin-page-title">Admin Dashboard</h1>
          <p className="admin-page-sub">Monitor users, API usage, and itinerary data.</p>
        </div>
        <div className="admin-topbar-actions">
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadUsage} disabled={loadingUsage}>
            {loadingUsage ? 'Refreshing…' : '↺ Refresh Usage'}
          </button>
          <button type="button" className="btn btn-secondary btn-sm" onClick={loadUsers} disabled={loadingUsers}>
            {loadingUsers ? 'Refreshing…' : '↺ Refresh Users'}
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ maxWidth: 900, margin: '0 auto var(--sp-6)' }}>{error}</div>}

      {/* ── KPI stat cards ────────────────────────────────────────────────── */}
      <div className="admin-kpi-row">
        <StatCard label="Total Users" value={totalUsers} sub="active accounts" />
        <StatCard label="Requests Today" value={globalUsage ? globalUsage.usage.day.requests : '—'} sub={globalUsage ? `of ${globalUsage.limits.global.rpd} limit` : ''} />
        <StatCard label="Tokens Today" value={globalUsage ? globalUsage.usage.day.tokens.toLocaleString() : '—'} sub="tokens consumed" accent />
        <StatCard label="Minute Requests" value={globalUsage ? globalUsage.usage.minute.requests : '—'} sub={globalUsage ? `of ${globalUsage.limits.global.rpm} RPM` : ''} />
      </div>

      {/* ── Usage charts ─────────────────────────────────────────────────── */}
      {globalUsage && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>API Usage Overview</h2>
            <span className="admin-section-meta">
              Window: {new Date(globalUsage.window.minuteStart).toLocaleTimeString()} / {new Date(globalUsage.window.dayStart).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className="admin-chart-grid">
            <div className="admin-chart-card">
              <h4>Global Limits</h4>
              <BarChart label="Req/min" value={globalUsage.usage.minute.requests} max={globalUsage.limits.global.rpm} />
              <BarChart label="Tok/min" value={globalUsage.usage.minute.tokens} max={globalUsage.limits.global.tpm} />
              <BarChart label="Req/day" value={globalUsage.usage.day.requests} max={globalUsage.limits.global.rpd} />
            </div>
            <div className="admin-chart-card">
              <h4>Per-User Limits</h4>
              <div className="admin-limit-grid">
                <div className="admin-limit-item">
                  <span className="admin-limit-num">{globalUsage.limits.user.rpm}</span>
                  <span>RPM</span>
                </div>
                <div className="admin-limit-item">
                  <span className="admin-limit-num">{globalUsage.limits.user.tpm.toLocaleString()}</span>
                  <span>TPM</span>
                </div>
                <div className="admin-limit-item">
                  <span className="admin-limit-num">{globalUsage.limits.user.rpd}</span>
                  <span>RPD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── User usage table ──────────────────────────────────────────────── */}
      {globalUsage && (
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Per-User Usage</h2>
          </div>
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Req/min</th>
                  <th>Tok/min</th>
                  <th>Req/day</th>
                  <th>Tok/day</th>
                  <th>Usage (day)</th>
                </tr>
              </thead>
              <tbody>
                {userUsage.length ? userUsage.map((entry) => {
                  const dayPct = globalUsage ? Math.min((entry.day.requests / globalUsage.limits.user.rpd) * 100, 100) : 0;
                  const fillColor = dayPct > 80 ? '#DC2626' : dayPct > 50 ? '#D4963A' : '#059669';
                  return (
                    <tr key={entry.user._id}
                      className={selectedUserId === entry.user._id ? 'admin-table-row--selected' : ''}
                      onClick={() => handleSelectUser(entry.user._id)}
                      style={{ cursor: 'pointer' }}>
                      <td><strong>{entry.user.username}</strong></td>
                      <td className="admin-table-muted">{entry.user.email}</td>
                      <td>{entry.minute.requests}</td>
                      <td>{entry.minute.tokens.toLocaleString()}</td>
                      <td>{entry.day.requests}</td>
                      <td>{entry.day.tokens.toLocaleString()}</td>
                      <td>
                        <div className="mini-bar-track">
                          <div className="mini-bar-fill" style={{ width: `${dayPct}%`, background: fillColor }} />
                        </div>
                      </td>
                    </tr>
                  );
                }) : (
                  <tr><td colSpan={7} className="admin-empty-row">No usage data yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Users + Details side-by-side ────────────────────────────────── */}
      <div className="admin-bottom-grid">

        {/* User list */}
        <div className="admin-section">
          <div className="admin-section-header">
            <h2>Users ({users.length})</h2>
          </div>
          {loadingUsers ? (
            <div className="admin-loading">Loading users…</div>
          ) : (
            <div className="admin-user-list">
              {users.map((user) => (
                <button
                  key={user._id}
                  type="button"
                  className={`admin-user-row${selectedUserId === user._id ? ' is-selected' : ''}`}
                  onClick={() => handleSelectUser(user._id)}
                >
                  <div className="admin-user-avatar">{user.username.charAt(0).toUpperCase()}</div>
                  <div className="admin-user-info-col">
                    <span className="admin-user-name">{user.username}</span>
                    <span className="admin-user-email">{user.email}</span>
                  </div>
                  <span className={`admin-role-badge ${user.role}`}>{user.role}</span>
                </button>
              ))}
              {!users.length && <div className="admin-loading">No users found.</div>}
            </div>
          )}
        </div>

        {/* User detail panel */}
        <div className="admin-section admin-detail-section">
          <div className="admin-section-header">
            <h2>User Details</h2>
          </div>

          {!selectedUserId && (
            <div className="admin-loading">Select a user from the list to view details.</div>
          )}

          {selectedUserId && loadingDetails && (
            <div className="admin-loading">Loading details…</div>
          )}

          {selectedUserId && details && !loadingDetails && (
            <div>
              <div className="admin-detail-grid">
                {[
                  { label: 'Username',     value: details.user.username },
                  { label: 'Email',        value: details.user.email },
                  { label: 'Role',         value: details.user.role },
                  { label: 'Account Type', value: details.user.accountType },
                ].map((row) => (
                  <div key={row.label} className="admin-detail-row">
                    <span className="admin-detail-label">{row.label}</span>
                    <span className={`admin-detail-val${row.label === 'Role' ? ` admin-role-badge ${details.user.role}` : ''}`}>
                      {row.value}
                    </span>
                  </div>
                ))}
              </div>

              {details.user.role !== 'admin' && (
                <div className="admin-itins">
                  <h3 className="admin-itins-title">
                    Saved Itineraries ({details.itineraries.length})
                  </h3>
                  {details.itineraries.length ? (
                    <div className="admin-itin-list">
                      {details.itineraries.map((itin, idx) => (
                        <div key={itin._id} className="admin-itin-item">
                          <div className="admin-itin-header">
                            <div>
                              <strong className="admin-itin-loc">{itin.location}</strong>
                              <span className="admin-itin-dates">
                                {new Date(itin.startDate).toLocaleDateString('en-GB')} — {new Date(itin.endDate).toLocaleDateString('en-GB')}
                              </span>
                            </div>
                            <button type="button" className="btn btn-secondary btn-sm"
                              onClick={() => handleToggleExpand(itin._id)}>
                              {expandedItineraryId === itin._id ? 'Collapse' : 'Expand'}
                            </button>
                          </div>
                          <div className="admin-itin-meta">
                            <span>{itin.adults} adults · {itin.children} children</span>
                            <span>₹{itin.budget} ({itin.budgetType === 'per_person' ? 'pp' : 'total'})</span>
                            <span>{itin.tripType}</span>
                          </div>
                          {expandedItineraryId === itin._id && (
                            <div className="admin-itin-text">
                              {itin.itineraryText.split('\n').map((line, i) => (
                                <p key={i}>{line}</p>
                              ))}
                            </div>
                          )}
                          <div className="admin-itin-footer">
                            Saved on {new Date(itin.createdAt).toLocaleDateString('en-GB')}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="admin-loading">No itineraries saved for this user.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default AdminDashboard;

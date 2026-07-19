import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authAPI } from '../utils/api.js';
import './Auth.css';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 5c-5.5 0-9.7 4.4-11 7 1.3 2.6 5.5 7 11 7s9.7-4.4 11-7c-1.3-2.6-5.5-7-11-7zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/>
    <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
  </svg>
);

const Register = () => {
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'user', adminCode: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRoleChange = (role) => setFormData((p) => ({ ...p, role }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      await authAPI.register(formData);
      setSuccess('Account created! Redirecting to sign in…');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page fade-in">

      {/* Brand panel */}
      <div className="auth-brand">
        <div className="auth-brand-logo">
          <span className="auth-brand-logo-icon">✈</span>
          <span className="auth-brand-logo-text">DayOut</span>
        </div>
        <h2 className="auth-brand-headline">
          Start planning<br />your dream trip.
        </h2>
        <p className="auth-brand-sub">
          Create a free account and get AI-generated itineraries for any destination in the world — tailored perfectly to you.
        </p>
        <ul className="auth-brand-facts">
          <li><span>✓</span> Free to sign up — no credit card needed</li>
          <li><span>✓</span> Unlimited itinerary generations</li>
          <li><span>✓</span> Save and revisit all your trips</li>
          <li><span>✓</span> Download itineraries as PDF</li>
        </ul>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <h1 className="auth-title">Create account</h1>
          <p className="auth-subtitle">Join DayOut and start planning for free.</p>

          {error   && <div className="alert alert-error">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}

          <div className="role-toggle" role="tablist" aria-label="Register role">
            <button type="button" className={`role-tab${formData.role === 'user' ? ' is-active' : ''}`}
              onClick={() => handleRoleChange('user')} disabled={loading} role="tab" aria-selected={formData.role === 'user'}>
              User
            </button>
            <button type="button" className={`role-tab${formData.role === 'admin' ? ' is-active' : ''}`}
              onClick={() => handleRoleChange('admin')} disabled={loading} role="tab" aria-selected={formData.role === 'admin'}>
              Admin
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="reg-username">Username</label>
              <input type="text" id="reg-username" name="username" value={formData.username}
                onChange={handleChange} required className="form-input" disabled={loading}
                minLength={3} autoComplete="username" />
            </div>

            <div className="form-group">
              <label htmlFor="reg-email">Email</label>
              <input type="email" id="reg-email" name="email" value={formData.email}
                onChange={handleChange} required className="form-input" disabled={loading} autoComplete="email" />
            </div>

            <div className="form-group">
              <label htmlFor="reg-password">Password</label>
              <div className="password-field">
                <input type={showPassword ? 'text' : 'password'} id="reg-password" name="password"
                  value={formData.password} onChange={handleChange} required className="form-input"
                  disabled={loading} minLength={6} autoComplete="new-password" />
                <button type="button" className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon />
                </button>
              </div>
              <p className="form-hint">Minimum 6 characters.</p>
            </div>

            {formData.role === 'admin' && (
              <div className="form-group">
                <label htmlFor="reg-adminCode">Admin Registration Code</label>
                <input type="password" id="reg-adminCode" name="adminCode" value={formData.adminCode}
                  onChange={handleChange} required className="form-input" disabled={loading} minLength={4} />
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Creating account…' : 'Create Account →'}
            </button>
          </form>

          <p className="auth-link">
            Already have an account? <Link to="/login">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;

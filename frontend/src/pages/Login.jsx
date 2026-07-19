import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import { authAPI } from '../utils/api.js';
import './Auth.css';

const EyeIcon = () => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path fill="currentColor" d="M12 5c-5.5 0-9.7 4.4-11 7 1.3 2.6 5.5 7 11 7s9.7-4.4 11-7c-1.3-2.6-5.5-7-11-7zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"/>
    <circle cx="12" cy="12" r="2.5" fill="currentColor"/>
  </svg>
);

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '', role: 'user' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });
  const handleRoleChange = (role) => setFormData((p) => ({ ...p, role }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await authAPI.login(formData);
      const { token, ...userData } = response.data;
      login(userData, token);
      navigate(userData.role === 'admin' ? '/admin' : '/home');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Please try again.');
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
          Travel smarter,<br />plan effortlessly.
        </h2>
        <p className="auth-brand-sub">
          DayOut uses AI to build day-by-day itineraries tailored to your budget, pace, and style — in seconds.
        </p>
        <ul className="auth-brand-facts">
          <li><span>✓</span> AI-powered personalised itineraries</li>
          <li><span>✓</span> Time-based schedules for every day</li>
          <li><span>✓</span> Travel &amp; accommodation suggestions</li>
          <li><span>✓</span> Save and download your plans as PDF</li>
        </ul>
      </div>

      {/* Form panel */}
      <div className="auth-form-panel">
        <div className="auth-card">
          <h1 className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to your DayOut account.</p>

          {error && <div className="alert alert-error">{error}</div>}

          <div className="role-toggle" role="tablist" aria-label="Login role">
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
              <label htmlFor="username">Username</label>
              <input type="text" id="username" name="username" value={formData.username}
                onChange={handleChange} required className="form-input" disabled={loading} autoComplete="username" />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="password-field">
                <input type={showPassword ? 'text' : 'password'} id="password" name="password"
                  value={formData.password} onChange={handleChange} required className="form-input"
                  disabled={loading} autoComplete="current-password" />
                <button type="button" className="password-toggle"
                  onClick={() => setShowPassword((p) => !p)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  <EyeIcon />
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading} style={{ marginTop: '8px' }}>
              {loading ? 'Signing in…' : 'Sign In →'}
            </button>
          </form>

          <p className="auth-link">
            Don't have an account? <Link to="/register">Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;

import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../utils/api.js';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user: authUser, logout, updateUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [theme, setTheme] = useState('coastal');
  const [themeMode, setThemeMode] = useState('light');
  const [personalForm, setPersonalForm] = useState({
    username: '',
    email: ''
  });
  const [personalLoading, setPersonalLoading] = useState(false);
  const [personalError, setPersonalError] = useState('');
  const [personalSuccess, setPersonalSuccess] = useState('');
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeSection, setActiveSection] = useState('account');
  const [settingsSection, setSettingsSection] = useState('');
  const [deletePassword, setDeletePassword] = useState('');
  const [showDeletePassword, setShowDeletePassword] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUser(response.data);
        setPersonalForm({
          username: response.data.username || '',
          email: response.data.email || ''
        });
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  useEffect(() => {
    const storedTheme = localStorage.getItem('dayout-theme') || 'coastal';
    const storedMode = localStorage.getItem('dayout-mode') || 'light';
    setTheme(storedTheme);
    setThemeMode(storedMode);
    const modeSuffix = storedMode === 'dark' ? '-dark' : '';
    document.documentElement.setAttribute('data-theme', `${storedTheme}${modeSuffix}`);
  }, []);

  const handleThemeChange = (event) => {
    const nextTheme = event.target.value;
    setTheme(nextTheme);
    localStorage.setItem('dayout-theme', nextTheme);
    const modeSuffix = themeMode === 'dark' ? '-dark' : '';
    document.documentElement.setAttribute('data-theme', `${nextTheme}${modeSuffix}`);
  };

  const handlePersonalChange = (e) => {
    setPersonalForm({
      ...personalForm,
      [e.target.name]: e.target.value
    });
  };

  const handlePersonalSubmit = async (e) => {
    e.preventDefault();
    setPersonalError('');
    setPersonalSuccess('');
    setPersonalLoading(true);

    try {
      const response = await userAPI.updateProfile({
        username: personalForm.username,
        email: personalForm.email
      });
      setUser(response.data);
      updateUser({
        ...authUser,
        username: response.data.username,
        email: response.data.email
      });
      setPersonalSuccess('Profile updated successfully.');
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update profile.';
      setPersonalError(message);
    } finally {
      setPersonalLoading(false);
    }
  };

  const handleModeChange = () => {
    const nextMode = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(nextMode);
    localStorage.setItem('dayout-mode', nextMode);
    const modeSuffix = nextMode === 'dark' ? '-dark' : '';
    document.documentElement.setAttribute('data-theme', `${theme}${modeSuffix}`);
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({
      ...passwordForm,
      [e.target.name]: e.target.value
    });
  };

  const handleChangePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New password and confirm password do not match.');
      return;
    }

    setPasswordLoading(true);

    try {
      await userAPI.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      setPasswordSuccess('Password updated successfully.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      const message = err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to update password.';
      setPasswordError(message);
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm('This will permanently delete your account and itineraries. Continue?');
    if (!confirmed) return;

    if (!deletePassword) {
      setPasswordError('Please enter your password to confirm deletion.');
      return;
    }

    setDeleteLoading(true);
    setPasswordError('');
    setPasswordSuccess('');

    try {
      await userAPI.deleteAccount({ password: deletePassword });
      logout();
    } catch (err) {
      const message = err.response?.data?.message || 'Failed to delete account.';
      setPasswordError(message);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
      </div>
    );
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  return (
    <div className="profile-container fade-in">
      <div className="profile-card reveal">
        <div className="profile-header">
          <h2 className="profile-title">Profile</h2>
        </div>

        {user && (
          <div className="profile-layout">
            <aside className="profile-sidebar">
              <button
                type="button"
                className={`profile-nav-item ${activeSection === 'account' ? 'is-active' : ''}`}
                onClick={() => setActiveSection('account')}
              >
                Account
              </button>
              <button
                type="button"
                className={`profile-nav-item ${activeSection === 'personal' ? 'is-active' : ''}`}
                onClick={() => setActiveSection('personal')}
              >
                Personal Info
              </button>
              <button
                type="button"
                className={`profile-nav-item ${activeSection === 'appearance' ? 'is-active' : ''}`}
                onClick={() => setActiveSection('appearance')}
              >
                Appearance
              </button>
              <button
                type="button"
                className={`profile-nav-item ${activeSection === 'settings' ? 'is-active' : ''}`}
                onClick={() => setActiveSection('settings')}
              >
                Settings
              </button>
              <button
                type="button"
                className="profile-nav-item profile-nav-logout"
                onClick={handleLogout}
              >
                Log Out
              </button>
            </aside>

            <section className="profile-panel">
              {activeSection === 'account' && (
                <div className="profile-panel-content">
                  <h3>Account</h3>
                  <div className="profile-detail">
                    <strong>Username:</strong>
                    <span>{user.username}</span>
                  </div>
                  <div className="profile-detail">
                    <strong>Email:</strong>
                    <span>{user.email}</span>
                  </div>
                  <div className="profile-detail">
                    <strong>Member Since:</strong>
                    <span>{new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}</span>
                  </div>
                  {authUser?.role !== 'admin' && (
                    <div className="profile-action">
                      <Link to="/past-itineraries" className="btn btn-secondary">
                        View Past Itineraries
                      </Link>
                    </div>
                  )}
                </div>
              )}

              {activeSection === 'personal' && (
                <div className="profile-panel-content">
                  <h3>Personal Info</h3>
                  {personalError && <div className="alert alert-error">{personalError}</div>}
                  {personalSuccess && <div className="alert alert-success">{personalSuccess}</div>}

                  <form className="profile-form" onSubmit={handlePersonalSubmit}>
                    <div className="form-group">
                      <label htmlFor="profile-username">Username:</label>
                      <input
                        type="text"
                        id="profile-username"
                        name="username"
                        value={personalForm.username}
                        onChange={handlePersonalChange}
                        required
                        className="form-input"
                        minLength={3}
                        disabled={personalLoading}
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="profile-email">Email:</label>
                      <input
                        type="email"
                        id="profile-email"
                        name="email"
                        value={personalForm.email}
                        onChange={handlePersonalChange}
                        required
                        className="form-input"
                        disabled={personalLoading}
                      />
                    </div>
                    <button type="submit" className="btn btn-primary" disabled={personalLoading}>
                      {personalLoading ? 'Updating...' : 'Update Info'}
                    </button>
                  </form>
                </div>
              )}

              {activeSection === 'appearance' && (
                <div className="profile-panel-content">
                  <h3>Appearance</h3>
                  <div className="profile-detail profile-theme">
                    <strong>Theme Preference:</strong>
                    <div>
                      <select
                        id="profile-theme"
                        value={theme}
                        onChange={handleThemeChange}
                        className="form-input"
                      >
                        <option value="coastal">Coastal Voyage</option>
                        <option value="desert">Sunrise Desert</option>
                        <option value="forest">Forest Trek</option>
                        <option value="atlas">City Atlas</option>
                      </select>
                      <button
                        type="button"
                        className={`theme-toggle ${themeMode === 'dark' ? 'is-dark' : ''}`}
                        onClick={handleModeChange}
                        aria-label="Toggle dark mode"
                        style={{ marginTop: '10px' }}
                      >
                        <span>{themeMode === 'dark' ? 'Dark' : 'Light'}</span>
                        <span className="theme-toggle-indicator" aria-hidden="true"></span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {activeSection === 'settings' && (
                <div className="profile-panel-content">
                  <h3>Settings</h3>
                  <div className="profile-settings-list">
                    <button
                      type="button"
                      className={`profile-settings-card ${settingsSection === 'password' ? 'is-active' : ''}`}
                      onClick={() => setSettingsSection('password')}
                    >
                      <span>Change Password</span>
                      <small>Update your current password.</small>
                    </button>
                    <button
                      type="button"
                      className={`profile-settings-card ${settingsSection === 'delete' ? 'is-active' : ''}`}
                      onClick={() => setSettingsSection('delete')}
                    >
                      <span>Delete Account</span>
                      <small>Permanently remove your account.</small>
                    </button>
                  </div>

                  {settingsSection === 'password' && (
                    <div className="profile-subsection">
                      <h4>Change Password</h4>
                      {passwordError && <div className="alert alert-error">{passwordError}</div>}
                      {passwordSuccess && <div className="alert alert-success">{passwordSuccess}</div>}

                      <form className="profile-form" onSubmit={handleChangePasswordSubmit}>
                        <div className="form-group">
                          <label htmlFor="currentPassword">Current Password:</label>
                          <div className="password-field">
                            <input
                              type={showCurrentPassword ? 'text' : 'password'}
                              id="currentPassword"
                              name="currentPassword"
                              value={passwordForm.currentPassword}
                              onChange={handlePasswordChange}
                              required
                              className="form-input"
                              disabled={passwordLoading}
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowCurrentPassword((prev) => !prev)}
                              aria-label={showCurrentPassword ? 'Hide password' : 'Show password'}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  fill="currentColor"
                                  d="M12 5c-5.5 0-9.7 4.4-11 7 1.3 2.6 5.5 7 11 7s9.7-4.4 11-7c-1.3-2.6-5.5-7-11-7zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"
                                />
                                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="newPassword">New Password:</label>
                          <div className="password-field">
                            <input
                              type={showNewPassword ? 'text' : 'password'}
                              id="newPassword"
                              name="newPassword"
                              value={passwordForm.newPassword}
                              onChange={handlePasswordChange}
                              required
                              className="form-input"
                              disabled={passwordLoading}
                              minLength={6}
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowNewPassword((prev) => !prev)}
                              aria-label={showNewPassword ? 'Hide password' : 'Show password'}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  fill="currentColor"
                                  d="M12 5c-5.5 0-9.7 4.4-11 7 1.3 2.6 5.5 7 11 7s9.7-4.4 11-7c-1.3-2.6-5.5-7-11-7zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"
                                />
                                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div className="form-group">
                          <label htmlFor="confirmPassword">Confirm New Password:</label>
                          <div className="password-field">
                            <input
                              type={showConfirmPassword ? 'text' : 'password'}
                              id="confirmPassword"
                              name="confirmPassword"
                              value={passwordForm.confirmPassword}
                              onChange={handlePasswordChange}
                              required
                              className="form-input"
                              disabled={passwordLoading}
                              minLength={6}
                            />
                            <button
                              type="button"
                              className="password-toggle"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                            >
                              <svg viewBox="0 0 24 24" aria-hidden="true">
                                <path
                                  fill="currentColor"
                                  d="M12 5c-5.5 0-9.7 4.4-11 7 1.3 2.6 5.5 7 11 7s9.7-4.4 11-7c-1.3-2.6-5.5-7-11-7zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"
                                />
                                <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        <button type="submit" className="btn btn-primary" disabled={passwordLoading}>
                          {passwordLoading ? 'Updating...' : 'Update Password'}
                        </button>
                      </form>
                    </div>
                  )}

                  {settingsSection === 'delete' && (
                    <div className="profile-subsection profile-danger">
                      <h4>Delete Account</h4>
                      <p className="profile-danger-text">Delete your account and all saved itineraries permanently.</p>
                      <div className="form-group">
                        <label htmlFor="deletePassword">Confirm Password:</label>
                        <div className="password-field">
                          <input
                            type={showDeletePassword ? 'text' : 'password'}
                            id="deletePassword"
                            name="deletePassword"
                            value={deletePassword}
                            onChange={(e) => setDeletePassword(e.target.value)}
                            required
                            className="form-input"
                            disabled={deleteLoading}
                          />
                          <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowDeletePassword((prev) => !prev)}
                            aria-label={showDeletePassword ? 'Hide password' : 'Show password'}
                          >
                            <svg viewBox="0 0 24 24" aria-hidden="true">
                              <path
                                fill="currentColor"
                                d="M12 5c-5.5 0-9.7 4.4-11 7 1.3 2.6 5.5 7 11 7s9.7-4.4 11-7c-1.3-2.6-5.5-7-11-7zm0 11.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9z"
                              />
                              <circle cx="12" cy="12" r="2.5" fill="currentColor" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <button
                        type="button"
                        className="btn btn-delete"
                        onClick={handleDeleteAccount}
                        disabled={deleteLoading}
                      >
                        {deleteLoading ? 'Deleting...' : 'Delete Account'}
                      </button>
                    </div>
                  )}

                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;

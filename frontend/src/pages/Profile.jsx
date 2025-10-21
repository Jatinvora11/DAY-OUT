import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { userAPI } from '../utils/api.js';
import { Link } from 'react-router-dom';
import './Profile.css';

const Profile = () => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await userAPI.getProfile();
        setUser(response.data);
      } catch (err) {
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

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
      <div className="profile-card">
        <div className="profile-header">
          <h2 className="profile-title">Profile</h2>
        </div>

        {user && (
          <div className="profile-details">
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
          </div>
        )}

        <div className="profile-action">
          <Link to="/past-itineraries" className="btn btn-primary">
            View Past Itineraries
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Profile;

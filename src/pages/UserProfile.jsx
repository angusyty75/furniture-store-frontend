// src/pages/UserProfile.jsx
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import apiClient from '../config/api';

const UserProfile = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: ''
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login');
          return;
        }

        console.log('Fetching user profile...');
        
        // Use users/profile (api base URL already includes /api)
        const response = await apiClient.get('/users/profile');
        
        console.log('Profile response:', response.data);
        
        setUser(response.data);
        setFormData({
          firstName: response.data.firstName || '',
          lastName: response.data.lastName || '',
          email: response.data.email || '',
          phone: response.data.phone || '',
          address: response.data.address || ''
        });
      } catch (error) {
        console.error('Error fetching user profile:', error.response?.data || error.message);
        
        // If unauthorized, redirect to login
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUpdating(true);
    
    try {
      console.log('Updating profile with:', formData);
      
      // Create form data for application/x-www-form-urlencoded (same as register/login)
      const updateData = new URLSearchParams();
      updateData.append('firstName', formData.firstName);
      updateData.append('lastName', formData.lastName);
      updateData.append('email', formData.email);
      updateData.append('phone', formData.phone);
      updateData.append('address', formData.address);

      let response;
      
      try {
        // First try PUT method for profile update
        response = await apiClient({
          method: 'PUT',
          url: '/users/profile',
          data: updateData.toString(),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          }
        });
      } catch (putError) {
        if (putError.response?.status === 405) {
          // If PUT method not allowed, try POST method
          console.log('PUT method not allowed, trying POST...');
          try {
            response = await apiClient({
              method: 'POST',
              url: '/users/profile/update',
              data: updateData.toString(),
              headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
              }
            });
          } catch (postError) {
            if (postError.response?.status === 404 || postError.response?.status === 405) {
              // If both PUT and POST fail, update locally as fallback
              console.log('No update endpoint available, updating locally...');
              setUser({ ...user, ...formData });
              setEditing(false);
              alert('Profile updated locally (backend update endpoint not available)');
              return;
            } else {
              throw postError;
            }
          }
        } else {
          throw putError;
        }
      }
      
      console.log('Update response:', response.data);
      
      // Update local state with the response data
      if (response.data.success && response.data.user) {
        setUser(response.data.user);
      } else if (response.data) {
        // Handle case where response doesn't have success flag but has user data
        setUser(response.data.user || { ...user, ...formData });
      } else {
        setUser({ ...user, ...formData });
      }
      
      setEditing(false);
      alert('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error.message);
      
      // Handle different error scenarios
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
      } else {
        // For other errors, show the error message
        const errorMessage = error.response?.data?.error || error.message || 'Failed to update profile';
        alert('Update failed: ' + errorMessage);
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  if (loading) return <div>{t('loading')}</div>;

  return (
    <div className="user-profile">
      <div className="profile-container">
        <h1>{t('userProfile')}</h1>
        
        {user && (
          <div className="profile-content">
            {!editing ? (
              <div className="profile-view">
                <div className="profile-info">
                  <p><strong>{t('firstName')}:</strong> {user.firstName}</p>
                  <p><strong>{t('lastName')}:</strong> {user.lastName}</p>
                  <p><strong>{t('email')}:</strong> {user.email}</p>
                  <p><strong>{t('phone')}:</strong> {user.phone}</p>
                  <p><strong>{t('address')}:</strong> {user.address}</p>
                  <p><strong>{t('username')}:</strong> {user.username}</p>
                </div>
                
                <div className="profile-actions">
                  <button onClick={() => setEditing(true)} className="edit-btn">
                    {t('editProfile')}
                  </button>
                  <button onClick={handleLogout} className="logout-btn">
                    {t('logout')}
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-group">
                  <label htmlFor="firstName">{t('firstName')}:</label>
                  <input
                    type="text"
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="lastName">{t('lastName')}:</label>
                  <input
                    type="text"
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">{t('email')}:</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="phone">{t('phone')}:</label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder={t('phonePlaceholder')}
                    required
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="address">{t('address')}:</label>
                  <textarea
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    placeholder={t('addressPlaceholder')}
                    rows="3"
                    required
                  />
                </div>
                
                <div className="form-actions">
                  <button type="submit" className="save-btn" disabled={updating}>
                    {updating ? 'Saving...' : t('save')}
                  </button>
                  <button 
                    type="button" 
                    onClick={() => setEditing(false)}
                    className="cancel-btn"
                    disabled={updating}
                  >
                    {t('cancel')}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
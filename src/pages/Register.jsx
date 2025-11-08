// src/pages/Register.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../config/api';

const Register = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    address: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      setLoading(false);
      return;
    }

    try {
      // Create form data for application/x-www-form-urlencoded (same as login)
      const registerData = new URLSearchParams();
      registerData.append('username', formData.username);
      registerData.append('email', formData.email);
      registerData.append('password', formData.password);
      registerData.append('firstName', formData.firstName);
      registerData.append('lastName', formData.lastName);
      registerData.append('phone', formData.phone);
      registerData.append('address', formData.address);

      console.log('Sending registration data:', {
        username: formData.username,
        email: formData.email,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        address: formData.address,
        password: '***'
      });

      // Use same format as login - form-urlencoded data
      const response = await apiClient({
        method: 'POST',
        url: '/api/users/register',
        data: registerData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      console.log('Registration successful:', response.data);
      
      // Note: Registration endpoint might not return a token, check the response
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }
      localStorage.setItem('user', JSON.stringify(response.data.user));
      navigate('/login'); // Redirect to login instead of home after registration
    } catch (error) {
      console.error('Registration error:', error.response?.data || error.message);
      
      if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Registration failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register">
      <div className="register-container">
        <h1>{t('register')}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="register-form">
          <div className="form-group">
            <label htmlFor="username">{t('username')}:</label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              required
            />
          </div>
          
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
          
          <div className="form-group">
            <label htmlFor="password">{t('password')}:</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="confirmPassword">{t('confirmPassword')}:</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
            />
          </div>
          
          <button type="submit" disabled={loading} className="register-btn">
            {loading ? 'Registering...' : t('register')}
          </button>
        </form>
        
        <p className="auth-link">
          Already have an account? <Link to="/login">{t('login')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
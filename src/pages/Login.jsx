// src/pages/Login.jsx
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, Link } from 'react-router-dom';
import apiClient from '../config/api';

const Login = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: '',
    password: ''
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

    try {
      // Create form data for application/x-www-form-urlencoded
      const loginData = new URLSearchParams();
      loginData.append('username', formData.username);
      loginData.append('password', formData.password);

      console.log('Sending login data:', {
        username: formData.username,
        password: '***'
      });

      // Use apiClient with form data (URL will be /users/login, base URL already includes /api)
      const response = await apiClient({
        method: 'POST',
        url: '/users/login',
        data: loginData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      console.log('Login successful:', response.data);
      
      // Store JWT token and user data
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
        console.log('JWT token stored successfully');
      }
      
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
        console.log('User data stored:', response.data.user.username);
      }
      
      // Navigate to home page
      navigate('/');
      
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      if (error.response?.status === 401) {
        setError('Invalid email or password');
      } else if (error.response?.data?.error) {
        setError(error.response.data.error);
      } else {
        setError('Login failed. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login">
      <div className="login-container">
        <h1>{t('login')}</h1>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="login-form">
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
          
          <button type="submit" disabled={loading} className="login-btn">
            {loading ? 'Logging in...' : t('login')}
          </button>
        </form>
        
        <p className="auth-link">
          Don't have an account? <Link to="/register">{t('register')}</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
// src/components/ProtectedRoute.jsx
// Protected route component for JWT authentication
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import AuthUtils from '../utils/auth';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const isAuthenticated = AuthUtils.isAuthenticated();

  if (!isAuthenticated) {
    // Redirect to login page with return URL
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
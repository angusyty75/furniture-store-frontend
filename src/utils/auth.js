// src/utils/auth.js
// Frontend JWT authentication utilities

export const AuthUtils = {
  /**
   * Get JWT token from localStorage
   */
  getToken() {
    return localStorage.getItem('token');
  },

  /**
   * Get user data from localStorage
   */
  getUser() {
    const user = localStorage.getItem('user');
    try {
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      return null;
    }
  },

  /**
   * Check if user is authenticated (has valid token)
   */
  isAuthenticated() {
    const token = this.getToken();
    if (!token) return false;
    
    // Basic token format validation
    try {
      const parts = token.split('.');
      if (parts.length !== 3) return false;
      
      // Decode payload (without verification - that's done by backend)
      const payload = JSON.parse(atob(parts[1]));
      const now = Date.now() / 1000;
      
      // Check if token is expired
      if (payload.exp && payload.exp < now) {
        console.log('Token expired, removing from storage');
        this.logout();
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Invalid token format:', error);
      this.logout();
      return false;
    }
  },

  /**
   * Get Authorization header value
   */
  getAuthHeader() {
    const token = this.getToken();
    return token ? `Bearer ${token}` : null;
  },

  /**
   * Logout user - clear all stored data
   */
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    console.log('User logged out, storage cleared');
  },

  /**
   * Get username from stored user data
   */
  getUsername() {
    const user = this.getUser();
    return user ? user.username : null;
  }
};

export default AuthUtils;
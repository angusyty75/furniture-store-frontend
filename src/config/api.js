// src/config/api.js
import axios from 'axios';

// Environment-based API base URL configuration
const getApiBaseUrl = () => {
  // Check environment variable first (set by build scripts)
  const envBackend = import.meta.env.VITE_BACKEND_URL;
  if (envBackend) {
    console.log('🔧 Using environment-specified backend:', envBackend);
    return envBackend;
  }
  
  // Check if we're running on Azure Static Web Apps (production)
  if (window.location.hostname.includes('azurestaticapps.net')) {
    console.log('☁️ Detected Azure Static Web Apps - using production backend');
    return 'https://furniture-backend-eastasia.yellowwater-88dd853b.eastasia.azurecontainerapps.io/furniture-store/api';
  }
  
  // Local development detection based on frontend port
  const currentPort = window.location.port;
  let backendUrl;
  
  switch (currentPort) {
    case '5173': // Development mode frontend (using start-dev.ps1)
    case '5175': // Development mode frontend (alternative port)
      backendUrl = 'http://localhost:8081/furniture-store/api';
      console.log('🔧 Development mode - using backend port 8081');
      break;
    case '5174': // Production-backend mode (dev frontend → prod backend)
      backendUrl = 'http://localhost:8080/furniture-store/api';
      console.log('🏭 Dev-Prod mode - using production backend port 8080');
      break;
    case '4173': // Production mode frontend (preview)
      backendUrl = '/api'; // Use relative URL for Vite proxy
      console.log('🏭 Production preview - using Vite proxy to backend port 8080');
      break;
    default:
      // Default development configuration
      backendUrl = 'http://localhost:8081/furniture-store/api';
      console.log('📍 Default - using development backend port 8081');
  }
  
  return backendUrl;
};

const API_BASE_URL = getApiBaseUrl();

// Create axios instance with base configuration
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    console.log('🔑 Auth Debug - Token from localStorage:', token ? 'Found (' + token.substring(0, 20) + '...)' : 'NOT FOUND');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('✅ Auth Debug - Authorization header added:', config.headers.Authorization.substring(0, 30) + '...');
    } else {
      console.log('❌ Auth Debug - No token found, no Authorization header added');
    }
    
    // Add cache-busting in development mode for direct backend calls
    if (import.meta.env.DEV) {
      config.params = config.params || {};
      config.params._t = Date.now(); // Add timestamp to prevent caching
    }
    
    // Enhanced logging with environment context
    const isDebugMode = window.location.port === '5174' || window.location.port === '4173' || import.meta.env.VITE_DEBUG === 'true';
    if (isDebugMode || import.meta.env.DEV) {
      console.log('🚀 API Request:', {
        environment: import.meta.env.MODE,
        frontend_port: window.location.port,
        method: config.method?.toUpperCase(),
        baseURL: config.baseURL,
        url: config.url,
        fullURL: config.baseURL + config.url,
        headers: config.headers,
        params: config.params,
        data: config.data
      });
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => {
    const isDebugMode = window.location.port === '5174' || window.location.port === '4173' || import.meta.env.VITE_DEBUG === 'true';
    if (isDebugMode || import.meta.env.DEV) {
      console.log('✅ API Response:', {
        status: response.status,
        statusText: response.statusText,
        url: response.config.url,
        backend: response.config.baseURL,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    console.error('❌ API Error:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      data: error.response?.data
    });
    
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      // Redirect to login page
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
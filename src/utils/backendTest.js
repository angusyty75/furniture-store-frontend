// src/utils/backendTest.js
import apiClient from '../config/api';

export const testBackendConnection = async () => {
  try {
    console.log('🔍 Testing backend connection...');
    console.log('API Base URL:', apiClient.defaults.baseURL);
    
    const response = await apiClient.get('/api/products?lang=zh');
    console.log('✅ Backend connection successful!');
    console.log('Response data:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error);
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      statusText: error.response?.statusText,
      url: error.config?.url,
      baseURL: error.config?.baseURL
    });
    return { success: false, error: error.message };
  }
};

// Test if proxy is working
export const testProxyConnection = async () => {
  try {
    console.log('🔍 Testing proxy connection...');
    // This should go through the Vite proxy
    const response = await fetch('/api/products?lang=zh');
    console.log('Proxy response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Proxy connection successful!');
      console.log('Proxy data:', data);
      return { success: true, data };
    } else {
      console.error('❌ Proxy failed with status:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Proxy connection failed:', error);
    return { success: false, error: error.message };
  }
};

// Test direct connection (will likely fail due to CORS)
export const testDirectConnection = async () => {
  try {
    console.log('🔍 Testing direct connection...');
    const response = await fetch('http://localhost:8080/furniture-store/api/products?lang=zh');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Direct connection successful!');
      return { success: true, data };
    } else {
      console.error('❌ Direct connection failed with status:', response.status);
      return { success: false, error: `HTTP ${response.status}` };
    }
  } catch (error) {
    console.error('❌ Direct connection failed (likely CORS):', error);
    return { success: false, error: error.message };
  }
};
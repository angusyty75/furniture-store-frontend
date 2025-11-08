// src/utils/testApi.js
import apiClient from '../config/api';

// Test function to check backend connection
export const testBackendConnection = async () => {
  try {
    console.log('Testing backend connection...');
    const response = await apiClient.get('/api/products');
    console.log('✅ Backend connection successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Backend connection failed:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
    return { success: false, error: error.message };
  }
};

// Test specific product endpoint
export const testProductEndpoint = async (productId = 1) => {
  try {
    console.log(`Testing product endpoint for ID: ${productId}`);
    const response = await apiClient.get(`/api/products/${productId}`);
    console.log('✅ Product endpoint successful:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('❌ Product endpoint failed:', error.message);
    return { success: false, error: error.message };
  }
};
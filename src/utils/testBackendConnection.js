// src/utils/testBackendConnection.js
import apiClient from '../config/api';

export const testDirectConnection = async () => {
  console.log('🔍 Testing backend connection...');
  
  try {
    // Test 1: Direct backend call (should fail due to CORS)
    console.log('Test 1: Direct backend call to localhost:8080');
    const directResponse = await fetch('http://localhost:8080/furniture-store/api/products');
    console.log('✅ Direct call successful:', directResponse.status);
  } catch (error) {
    console.log('❌ Direct call failed (expected due to CORS):', error.message);
  }
  
  try {
    // Test 2: Proxied call through Vite
    console.log('Test 2: Proxied call through Vite dev server');
    const response = await apiClient.get('/api/products');
    console.log('✅ Proxied call successful:', response.status);
    console.log('📦 Data received:', response.data.length, 'products');
    return { success: true, data: response.data };
  } catch (error) {
    console.log('❌ Proxied call failed:', error.message);
    return { success: false, error: error.message };
  }
};

// Function to test from browser console
window.testBackend = testDirectConnection;
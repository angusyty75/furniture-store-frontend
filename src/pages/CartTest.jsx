// src/pages/CartTest.jsx
import React, { useState } from 'react';
import apiClient from '../config/api';

const CartTest = () => {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (test, success, data, error) => {
    setResults(prev => [...prev, { test, success, data, error, timestamp: new Date().toLocaleTimeString() }]);
  };

  const testLogin = async () => {
    try {
      console.log('Testing login...');
      const loginData = new URLSearchParams();
      loginData.append('username', 'mike_chen2');
      loginData.append('password', 'password123');

      const response = await apiClient({
        method: 'POST',
        url: '/api/users/login',
        data: loginData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      localStorage.setItem('token', response.data.token);
      addResult('Login', true, `Token: ${response.data.token.substring(0, 20)}...`, null);
      return response.data.token;
    } catch (error) {
      addResult('Login', false, null, error.response?.data?.error || error.message);
      return null;
    }
  };

  const testGetProducts = async () => {
    try {
      console.log('Testing get products...');
      const response = await apiClient.get('/api/products?limit=5');
      addResult('Get Products', true, `Found ${response.data.length} products`, null);
      return response.data;
    } catch (error) {
      addResult('Get Products', false, null, error.response?.data?.error || error.message);
      return null;
    }
  };

  const testAddToCart = async (productId = 15) => {
    try {
      console.log(`Testing add to cart with product ${productId}...`);
      
      const cartData = new URLSearchParams();
      cartData.append('productId', productId.toString());
      cartData.append('quantity', '1');

      console.log('Cart data:', cartData.toString());
      console.log('Token:', localStorage.getItem('token')?.substring(0, 20) + '...');

      const response = await apiClient({
        method: 'POST',
        url: '/api/cart/items',
        data: cartData.toString(),
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        }
      });

      addResult('Add to Cart', true, response.data, null);
      return response.data;
    } catch (error) {
      console.error('Cart error details:', error.response);
      addResult('Add to Cart', false, null, error.response?.data?.error || error.message);
      return null;
    }
  };

  const testGetCart = async () => {
    try {
      console.log('Testing get cart...');
      const response = await apiClient.get('/api/cart');
      addResult('Get Cart', true, response.data, null);
      return response.data;
    } catch (error) {
      addResult('Get Cart', false, null, error.response?.data?.error || error.message);
      return null;
    }
  };

  const runAllTests = async () => {
    setLoading(true);
    setResults([]);
    
    console.log('🚀 Starting cart functionality tests...');
    
    // Test 1: Login
    const token = await testLogin();
    if (!token) {
      setLoading(false);
      return;
    }

    // Test 2: Get products
    const products = await testGetProducts();
    if (!products || products.length === 0) {
      setLoading(false);
      return;
    }

    // Test 3: Add to cart
    await testAddToCart(products[0].id);

    // Test 4: Get cart
    await testGetCart();

    setLoading(false);
    console.log('✅ All tests completed');
  };

  const clearResults = () => {
    setResults([]);
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Cart Functionality Test</h1>
      
      <div style={{ marginBottom: '20px' }}>
        <button onClick={runAllTests} disabled={loading} style={{ marginRight: '10px' }}>
          {loading ? 'Running Tests...' : 'Run All Tests'}
        </button>
        <button onClick={clearResults}>Clear Results</button>
      </div>

      <div>
        <h2>Test Results:</h2>
        {results.length === 0 ? (
          <p>No tests run yet. Click "Run All Tests" to start.</p>
        ) : (
          <div>
            {results.map((result, index) => (
              <div 
                key={index} 
                style={{
                  border: '1px solid #ccc',
                  margin: '10px 0',
                  padding: '10px',
                  backgroundColor: result.success ? '#e8f5e8' : '#ffe8e8'
                }}
              >
                <div style={{ fontWeight: 'bold' }}>
                  {result.success ? '✅' : '❌'} {result.test} ({result.timestamp})
                </div>
                {result.success ? (
                  <div style={{ color: 'green' }}>
                    <strong>Success:</strong> {JSON.stringify(result.data, null, 2)}
                  </div>
                ) : (
                  <div style={{ color: 'red' }}>
                    <strong>Error:</strong> {result.error}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CartTest;
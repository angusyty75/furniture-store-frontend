// Test script to debug orders API
import apiClient from '../config/api.js';

export const testCartAndOrder = async () => {
  console.log('=== TESTING CART AND ORDER FLOW ===');
  
  // Check auth token
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('❌ No auth token found');
    return;
  }
  
  console.log('✅ Auth token found:', token.substring(0, 30) + '...');
  
  try {
    // Step 1: Check current cart
    console.log('🔍 Step 1: Checking current cart...');
    const cartResponse = await apiClient.get('/cart');
    console.log('Cart response:', cartResponse.data);
    
    if (!cartResponse.data.success || !cartResponse.data.cart || cartResponse.data.cart.items.length === 0) {
      console.log('⚠️ Cart is empty. You need to add items to cart first.');
      console.log('👉 Go to products page and add some items to cart before testing order creation.');
      alert('Cart is empty! Please add items to cart first, then test again.');
      return;
    }
    
    console.log(`✅ Cart has ${cartResponse.data.cart.items.length} items`);
    
    // Step 2: Try to create order
    console.log('🔍 Step 2: Creating order...');
    const testOrderData = new URLSearchParams();
    testOrderData.append('shippingAddress', '123 Test Street, Test City');
    testOrderData.append('billingAddress', '123 Test Street, Test City');
    testOrderData.append('paymentMethod', 'wechat_pay'); // Test with WeChat Pay
    testOrderData.append('contact_phone', '1234567890');
    testOrderData.append('contact_email', 'test@example.com');
    testOrderData.append('contact_person', 'Test User');
    
    const orderResponse = await apiClient.post('/orders', testOrderData.toString(), {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      }
    });
    
    console.log('✅ Order created successfully:', orderResponse.data);
    return orderResponse.data;
    
  } catch (error) {
    console.error('❌ Test failed:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestUrl: error.config?.url,
      requestMethod: error.config?.method,
      requestHeaders: error.config?.headers,
      requestData: error.config?.data
    });
    
    throw error;
  }
};

export const testOrdersAPI = testCartAndOrder; // Keep backward compatibility

// Make it available globally for browser console testing
if (typeof window !== 'undefined') {
  window.testCartAndOrder = testCartAndOrder;
  window.testOrdersAPI = testCartAndOrder;
}
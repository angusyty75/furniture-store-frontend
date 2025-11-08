// Utility to help test cart functionality
export const testCartFlow = async () => {
  console.log('=== CART FLOW TEST ===');
  
  // Step 1: Check if user is logged in
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ User not logged in');
    return false;
  }
  console.log('✅ User is logged in');
  
  // Step 2: Try to fetch cart
  try {
    const response = await fetch('/api/cart', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.log('❌ Failed to fetch cart:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Cart data:', data);
    
    if (data.success && data.cart && data.cart.items) {
      console.log(`✅ Cart has ${data.cart.items.length} items`);
      return data.cart.items;
    } else {
      console.log('⚠️ Cart is empty or invalid structure');
      return [];
    }
    
  } catch (error) {
    console.log('❌ Error fetching cart:', error);
    return false;
  }
};

// Test order creation without clearing cart
export const testOrderCreation = async (cartItems) => {
  console.log('=== ORDER CREATION TEST ===');
  console.log('Cart items before order:', cartItems.length);
  
  const token = localStorage.getItem('token');
  if (!token) {
    console.log('❌ No auth token');
    return false;
  }
  
  try {
    const orderData = new URLSearchParams();
    orderData.append('shippingAddress', 'Test Address 123');
    orderData.append('billingAddress', 'Test Address 123');
    orderData.append('paymentMethod', 'credit_card');
    orderData.append('contact_phone', '1234567890');
    orderData.append('contact_email', 'test@test.com');
    orderData.append('contact_person', 'Test User');
    
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: orderData.toString()
    });
    
    if (!response.ok) {
      console.log('❌ Order creation failed:', response.status);
      return false;
    }
    
    const data = await response.json();
    console.log('✅ Order response:', data);
    
    // Now check cart again
    const cartAfter = await testCartFlow();
    console.log('Cart items after order:', cartAfter ? cartAfter.length : 'error');
    
    return data;
    
  } catch (error) {
    console.log('❌ Error creating order:', error);
    return false;
  }
};

// Add this to window for easy testing in browser console
if (typeof window !== 'undefined') {
  window.testCartFlow = testCartFlow;
  window.testOrderCreation = testOrderCreation;
}
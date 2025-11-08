// Simple test to check authentication
console.log('=== AUTH DEBUG TEST ===');

// Check if token exists
const token = localStorage.getItem('token');
console.log('Token in localStorage:', token ? 'EXISTS' : 'NOT FOUND');

if (token) {
  console.log('Token preview:', token.substring(0, 50) + '...');
  
  // Test API call with token
  fetch('/api/cart', {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })
  .then(response => {
    console.log('Cart API response status:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('Cart API data:', data);
  })
  .catch(error => {
    console.error('Cart API error:', error);
  });
} else {
  console.log('❌ No token found - user not logged in');
}

// Make this available globally for testing
window.testAuth = () => {
  const token = localStorage.getItem('token');
  console.log('Token check:', token ? 'Found' : 'Missing');
  return !!token;
};
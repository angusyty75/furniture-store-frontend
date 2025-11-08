// Connection Testing Utilities
// This file provides simple functions to test different connection methods

export const testConnections = async () => {
  const results = {
    proxyTest: { success: false, error: null, data: null },
    directTest: { success: false, error: null, data: null },
    corsTest: { success: false, error: null, data: null }
  };

  console.log('🔍 Starting connection tests...');

  // Test 1: Proxy route (what the frontend should use)
  try {
    console.log('📡 Testing proxy route: /api/products');
    const proxyResponse = await fetch('/api/products');
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      results.proxyTest = { success: true, error: null, data: proxyData };
      console.log('✅ Proxy test PASSED:', proxyData);
    } else {
      results.proxyTest = { success: false, error: `HTTP ${proxyResponse.status}`, data: null };
      console.log('❌ Proxy test FAILED:', proxyResponse.status, proxyResponse.statusText);
    }
  } catch (error) {
    results.proxyTest = { success: false, error: error.message, data: null };
    console.log('❌ Proxy test ERROR:', error.message);
  }

  // Test 2: Direct backend (will likely fail due to CORS)
  try {
    console.log('📡 Testing direct backend: http://localhost:8080/furniture-store/api/products');
    const directResponse = await fetch('http://localhost:8080/furniture-store/api/products');
    if (directResponse.ok) {
      const directData = await directResponse.json();
      results.directTest = { success: true, error: null, data: directData };
      console.log('✅ Direct test PASSED:', directData);
    } else {
      results.directTest = { success: false, error: `HTTP ${directResponse.status}`, data: null };
      console.log('❌ Direct test FAILED:', directResponse.status, directResponse.statusText);
    }
  } catch (error) {
    results.directTest = { success: false, error: error.message, data: null };
    console.log('❌ Direct test ERROR:', error.message);
  }

  // Test 3: CORS preflight test
  try {
    console.log('📡 Testing CORS preflight...');
    const corsResponse = await fetch('http://localhost:8080/furniture-store/api/products', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:5174',
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'content-type'
      }
    });
    results.corsTest = { 
      success: corsResponse.ok, 
      error: corsResponse.ok ? null : `HTTP ${corsResponse.status}`,
      data: {
        status: corsResponse.status,
        headers: Object.fromEntries(corsResponse.headers.entries())
      }
    };
    console.log('🔍 CORS preflight result:', results.corsTest);
  } catch (error) {
    results.corsTest = { success: false, error: error.message, data: null };
    console.log('❌ CORS test ERROR:', error.message);
  }

  console.log('📊 Connection test results:', results);
  return results;
};

export const explainResults = (results) => {
  console.log('\n📋 Test Results Explanation:');
  
  if (results.proxyTest.success) {
    console.log('✅ PROXY TEST PASSED - Frontend can communicate with backend through Vite proxy');
    console.log('   This means your app should work correctly in development mode');
  } else {
    console.log('❌ PROXY TEST FAILED - There\'s an issue with the Vite proxy configuration');
    console.log('   Error:', results.proxyTest.error);
  }

  if (results.directTest.success) {
    console.log('✅ DIRECT TEST PASSED - Backend allows direct cross-origin requests');
    console.log('   This means your CORS is configured correctly');
  } else {
    console.log('❌ DIRECT TEST FAILED - Backend blocks cross-origin requests');
    console.log('   Error:', results.directTest.error);
    console.log('   This is expected in development; use the proxy instead');
  }

  if (results.corsTest.success) {
    console.log('✅ CORS PREFLIGHT PASSED - Backend handles OPTIONS requests correctly');
  } else {
    console.log('❌ CORS PREFLIGHT FAILED - Backend doesn\'t handle OPTIONS requests');
    console.log('   Error:', results.corsTest.error);
  }

  console.log('\n💡 Recommendations:');
  if (!results.proxyTest.success) {
    console.log('- Check Vite proxy configuration in vite.config.js');
    console.log('- Ensure backend is running on http://localhost:8080');
    console.log('- Verify the API endpoint exists at /furniture-store/api/products');
  }
  
  if (!results.directTest.success && !results.corsTest.success) {
    console.log('- Add proper CORS headers to your J2EE backend');
    console.log('- Ensure your CORS filter allows Origin: http://localhost:5174');
    console.log('- Check that the filter is properly registered in web.xml');
  }
};
/**
 * API Integration Test Script
 * Run this in browser console or Node.js to test API integration
 */

// Configuration
const API_BASE = 'http://localhost:3000/api/v1';
const TENANT_CODE = 'MAJU1234';
const CREDENTIALS = {
  email: 'admin@majujaya.id',
  password: 'password123'
};

/**
 * Test login and get token
 */
async function testLogin() {
  console.log('Testing login...');

  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(CREDENTIALS)
  });

  const data = await response.json();
  console.log('Login response:', data);

  if (data.success) {
    console.log('✅ Login successful!');
    console.log('Token:', data.data.accessToken.substring(0, 50) + '...');

    // Store token for subsequent requests
    const token = data.data.accessToken;
    const tenantId = data.data.user.tenant_id;

    // Test items endpoint
    await testItems(token, tenantId);

    // Test items types endpoint
    await testItemTypes(token, tenantId);

    return { token, tenantId };
  } else {
    console.error('❌ Login failed:', data.error);
    return null;
  }
}

/**
 * Test GET /items
 */
async function testItems(token, tenantId) {
  console.log('\nTesting GET /items...');

  const response = await fetch(`${API_BASE}/items?limit=3`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': tenantId
    }
  });

  const data = await response.json();
  console.log('Items response:', JSON.stringify(data, null, 2).substring(0, 500) + '...');

  if (data.success) {
    console.log(`✅ GET /items successful! Found ${data.data.length} items`);
    console.log('Meta:', data.meta);
    console.log('Summary (types):', data.summary?.types);
    return data;
  } else {
    console.error('❌ GET /items failed:', data.error);
    return null;
  }
}

/**
 * Test GET /items/types
 */
async function testItemTypes(token, tenantId) {
  console.log('\nTesting GET /items/types...');

  const response = await fetch(`${API_BASE}/items/types`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'X-Tenant-ID': tenantId
    }
  });

  const data = await response.json();
  console.log('Item types response:', JSON.stringify(data, null, 2));

  if (data.success) {
    console.log(`✅ GET /items/types successful! Found ${data.data.length} types`);
    return data;
  } else {
    console.error('❌ GET /items/types failed:', data.error);
    return null;
  }
}

// Run tests
testLogin()
  .then(result => {
    if (result) {
      console.log('\n🎉 All API tests passed!');
    } else {
      console.log('\n💥 Some API tests failed!');
    }
  })
  .catch(error => {
    console.error('Test error:', error);
  });

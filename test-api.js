#!/usr/bin/env node
/**
 * API Test Script
 * Tests the web-booking API endpoints
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:3000/api/v1';
const TENANT_CODE = process.env.TENANT_CODE || 'MAJU1234';

async function testApi() {
  console.log('='.repeat(50));
  console.log('API Test Script');
  console.log('='.repeat(50));
  console.log(`API Base URL: ${API_BASE_URL}`);
  console.log(`Tenant Code: ${TENANT_CODE}`);
  console.log();

  // Test 1: Public items endpoint
  console.log('Test 1: GET /public/items');
  try {
    const url = `${API_BASE_URL}/public/items?kode=${TENANT_CODE}&page=1&limit=4`;
    console.log(`  URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`  Status: ${response.status}`);
    console.log(`  Success: ${data.success}`);
    console.log(`  Data type: ${typeof data.data}`);
    console.log(`  Is Array: ${Array.isArray(data.data)}`);
    console.log(`  Items count: ${Array.isArray(data.data) ? data.data.length : 'N/A'}`);
    
    if (data.data && data.data.length > 0) {
      console.log('  First item:', JSON.stringify(data.data[0], null, 2).substring(0, 200) + '...');
    }
    
    if (data.meta) {
      console.log('  Meta:', JSON.stringify(data.meta));
    }
    
    console.log('  ✓ Test passed');
  } catch (error) {
    console.log('  ✗ Test failed:', error.message);
  }

  console.log();

  // Test 2: Public items types endpoint
  console.log('Test 2: GET /public/items/types');
  try {
    const url = `${API_BASE_URL}/public/items/types?kode=${TENANT_CODE}`;
    console.log(`  URL: ${url}`);
    
    const response = await fetch(url);
    const data = await response.json();
    
    console.log(`  Status: ${response.status}`);
    console.log(`  Success: ${data.success}`);
    console.log(`  Data:`, JSON.stringify(data.data, null, 2));
    
    console.log('  ✓ Test passed');
  } catch (error) {
    console.log('  ✗ Test failed:', error.message);
  }

  console.log();
  console.log('='.repeat(50));
  console.log('Tests completed');
  console.log('='.repeat(50));
}

testApi();

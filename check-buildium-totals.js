// Check actual Buildium API totals and limits
const BUILDIUM_CLIENT_ID = '2f088123-7525-4c95-8c41-30edb9a1da51';
const BUILDIUM_API_KEY = 'jBbIs4mYxqBaiZ4dTEkDW7bDjbA6meCz2W9nPK+V3B0=';
const BUILDIUM_BASE_URL = 'https://api.buildium.com';

async function makeRequest(endpoint) {
  try {
    const response = await fetch(`${BUILDIUM_BASE_URL}${endpoint}`, {
      method: 'GET',
      headers: {
        'x-buildium-client-id': BUILDIUM_CLIENT_ID,
        'x-buildium-client-secret': BUILDIUM_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`${response.status}: ${await response.text()}`);
    }

    const data = await response.json();
    const totalCount = response.headers.get('X-Total-Count');
    const rateLimit = response.headers.get('X-RateLimit-Remaining');
    
    return { 
      data, 
      returnedCount: data.length,
      totalCount: totalCount ? parseInt(totalCount) : null,
      rateLimit: rateLimit ? parseInt(rateLimit) : null,
      headers: {
        totalCount: response.headers.get('X-Total-Count'),
        rateLimit: response.headers.get('X-RateLimit-Remaining'),
        rateLimitLimit: response.headers.get('X-RateLimit-Limit')
      }
    };
  } catch (error) {
    console.error(`❌ ${endpoint}: ${error.message}`);
    return null;
  }
}

async function checkTotals() {
  console.log('🔍 CHECKING BUILDIUM API TOTALS & LIMITS');
  console.log('=' * 60);
  
  const endpoints = [
    { endpoint: '/v1/rentals?limit=1', name: 'Properties' },
    { endpoint: '/v1/rentals/units?limit=1', name: 'Units' },
    { endpoint: '/v1/leases?limit=1', name: 'Leases' },
    { endpoint: '/v1/rentals/owners?limit=1', name: 'Owners' },
    { endpoint: '/v1/workorders?limit=1', name: 'Work Orders' },
    { endpoint: '/v1/tasks?limit=1', name: 'Tasks' },
    { endpoint: '/v1/vendors?limit=1', name: 'Vendors' }
  ];
  
  for (const {endpoint, name} of endpoints) {
    console.log(`\n📊 Testing ${name}:`);
    const result = await makeRequest(endpoint);
    
    if (result) {
      console.log(`   ✅ Returned: ${result.returnedCount} records`);
      console.log(`   📈 Total Available: ${result.totalCount || 'Unknown'}`);
      console.log(`   🚦 Rate Limit Remaining: ${result.rateLimit || 'Unknown'}`);
      console.log(`   📋 Headers:`, JSON.stringify(result.headers, null, 4));
      
      if (result.totalCount && result.totalCount > 1000) {
        console.log(`   ⚠️  Large dataset detected! (${result.totalCount} total records)`);
      }
    }
  }
  
  // Test with higher limits to see if we get capped
  console.log('\n🔍 TESTING HIGH LIMITS:');
  const highLimitTests = [
    { endpoint: '/v1/rentals?limit=1000', name: 'Properties (limit=1000)' },
    { endpoint: '/v1/rentals/units?limit=1000', name: 'Units (limit=1000)' },
    { endpoint: '/v1/leases?limit=500', name: 'Leases (limit=500)' }
  ];
  
  for (const {endpoint, name} of highLimitTests) {
    console.log(`\n📊 Testing ${name}:`);
    const result = await makeRequest(endpoint);
    
    if (result) {
      console.log(`   📦 Actually Returned: ${result.returnedCount} records`);
      console.log(`   📈 Total Available: ${result.totalCount || 'Unknown'}`);
      
      if (result.totalCount && result.returnedCount < result.totalCount) {
        const percentage = (result.returnedCount / result.totalCount * 100).toFixed(1);
        console.log(`   ⚠️  Getting ${percentage}% of total data (${result.returnedCount}/${result.totalCount})`);
      }
    }
  }
  
  console.log('\n🎯 SUMMARY:');
  console.log('If any endpoint shows "returned < total", we need pagination!');
}

checkTotals().catch(console.error);
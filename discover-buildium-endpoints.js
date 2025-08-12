// Discover additional Buildium endpoints
const BUILDIUM_CLIENT_ID = '2f088123-7525-4c95-8c41-30edb9a1da51';
const BUILDIUM_API_KEY = 'jBbIs4mYxqBaiZ4dTEkDW7bDjbA6meCz2W9nPK+V3B0=';
const BUILDIUM_BASE_URL = 'https://api.buildium.com';

async function testEndpoint(endpoint, description) {
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

    if (response.ok) {
      const data = await response.json();
      console.log(`✅ ${description}: SUCCESS (${data.length || 'N/A'} records)`);
      return true;
    } else {
      console.log(`❌ ${description}: ${response.status}`);
      return false;
    }
  } catch (error) {
    console.log(`❌ ${description}: ${error.message}`);
    return false;
  }
}

async function discoverEndpoints() {
  console.log('🔍 DISCOVERING ADDITIONAL BUILDIUM ENDPOINTS');
  console.log('=' * 60);

  const endpointsToTest = [
    // Tenant variations
    ['/v1/tenants', 'Tenants'],
    ['/v1/rentals/tenants', 'Rental Tenants'],
    ['/v1/tenant', 'Tenant (singular)'],
    
    // Lease variations  
    ['/v1/lease', 'Lease (singular)'],
    ['/v1/rentals/leases', 'Rental Leases'],
    
    // History and movements
    ['/v1/rentals/moveins', 'Move-ins'],
    ['/v1/rentals/moveouts', 'Move-outs'],
    ['/v1/moveins', 'Move-ins (alt)'],
    ['/v1/moveouts', 'Move-outs (alt)'],
    ['/v1/history', 'History'],
    ['/v1/rental-history', 'Rental History'],
    ['/v1/rentals/history', 'Rentals History'],
    
    // Financial data
    ['/v1/rent-rolls', 'Rent Rolls'],
    ['/v1/rentals/rent-rolls', 'Rental Rent Rolls'],
    ['/v1/payments', 'Payments'],
    ['/v1/rentals/payments', 'Rental Payments'],
    
    // Vacancy tracking
    ['/v1/vacancies', 'Vacancies'],
    ['/v1/rentals/vacancies', 'Rental Vacancies'],
    ['/v1/listings', 'Listings'],
    ['/v1/rentals/listings', 'Rental Listings'],
    
    // Maintenance and work orders (already worked)
    ['/v1/maintenance', 'Maintenance'],
    ['/v1/tasks', 'Tasks'],
    
    // Reports
    ['/v1/reports', 'Reports'],
    ['/v1/rentals/reports', 'Rental Reports'],
    
    // Additional owner info
    ['/v1/owners', 'Owners (alt)'],
    
    // Contacts  
    ['/v1/contacts', 'Contacts'],
    ['/v1/vendors', 'Vendors'],
    
    // Document/file endpoints
    ['/v1/files', 'Files'],
    ['/v1/documents', 'Documents']
  ];

  console.log('\nTesting endpoints...\n');
  
  let successful = [];
  let failed = [];
  
  for (const [endpoint, description] of endpointsToTest) {
    const success = await testEndpoint(endpoint, description);
    if (success) {
      successful.push([endpoint, description]);
    } else {
      failed.push([endpoint, description]);
    }
  }
  
  console.log(`\n📊 RESULTS: ${successful.length} successful, ${failed.length} failed`);
  
  if (successful.length > 0) {
    console.log('\n✅ WORKING ENDPOINTS:');
    successful.forEach(([endpoint, desc]) => {
      console.log(`   ${endpoint} - ${desc}`);
    });
  }
  
  // Test with current date filters
  console.log('\n🗓️ TESTING DATE FILTERING:');
  const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
  const testDates = [
    [`/v1/leases?CreatedDateTimeFrom=${currentMonth}-01`, 'Recent Leases'],
    [`/v1/workorders?CreatedDateTimeFrom=${currentMonth}-01`, 'Recent Work Orders'],
  ];
  
  for (const [endpoint, description] of testDates) {
    await testEndpoint(endpoint, description);
  }
}

discoverEndpoints().catch(console.error);
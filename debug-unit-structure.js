// Debug actual unit structure to find occupancy field
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

    return await response.json();
  } catch (error) {
    console.error(`❌ ${endpoint}: ${error.message}`);
    return null;
  }
}

async function debugUnitStructure() {
  console.log('🔍 DEBUGGING UNIT DATA STRUCTURE');
  console.log('=' * 50);
  
  // Get a small sample of units to examine structure
  const units = await makeRequest('/v1/rentals/units?limit=10');
  if (!units) return;
  
  console.log(`📊 Examining ${units.length} sample units:`);
  
  units.forEach((unit, index) => {
    console.log(`\n📋 Unit ${index + 1} (ID: ${unit.Id}):`);
    console.log(JSON.stringify(unit, null, 2));
    
    // Check all possible occupancy-related fields
    const occupancyFields = Object.keys(unit).filter(key => 
      key.toLowerCase().includes('occupy') || 
      key.toLowerCase().includes('vacant') ||
      key.toLowerCase().includes('available') ||
      key.toLowerCase().includes('status')
    );
    
    console.log(`🔍 Potential occupancy fields: ${occupancyFields.length > 0 ? occupancyFields.join(', ') : 'None found'}`);
    
    // Check all possible rent fields
    const rentFields = Object.keys(unit).filter(key =>
      key.toLowerCase().includes('rent') ||
      key.toLowerCase().includes('rate') ||
      key.toLowerCase().includes('amount')
    );
    
    console.log(`💰 Potential rent fields: ${rentFields.length > 0 ? rentFields.join(', ') : 'None found'}`);
    
    if (index === 2) { // Only show first 3 for brevity
      console.log('\n... (showing only first 3 units)');
      return;
    }
  });
  
  // Get unique field names across all units
  const allFields = new Set();
  units.forEach(unit => {
    Object.keys(unit).forEach(key => allFields.add(key));
  });
  
  console.log(`\n📊 ALL UNIQUE FIELDS IN UNITS DATA:`);
  console.log(Array.from(allFields).sort().join(', '));
  
  // Check if there are different unit endpoints
  console.log(`\n🔍 Testing alternative unit endpoints:`);
  
  const alternativeEndpoints = [
    '/v1/rentals/units?IsAvailable=false',
    '/v1/rentals/units?IsOccupied=true',
    '/v1/rentals/units?status=occupied'
  ];
  
  for (const endpoint of alternativeEndpoints) {
    const result = await makeRequest(endpoint + '&limit=1');
    if (result && result.length > 0) {
      console.log(`✅ ${endpoint}: Found ${result.length} units`);
    } else {
      console.log(`❌ ${endpoint}: No data or error`);
    }
  }
}

debugUnitStructure().catch(console.error);
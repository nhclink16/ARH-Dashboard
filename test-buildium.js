// Simple Buildium API test
const BUILDIUM_CLIENT_ID = '2f088123-7525-4c95-8c41-30edb9a1da51';
const BUILDIUM_API_KEY = 'jBbIs4mYxqBaiZ4dTEkDW7bDjbA6meCz2W9nPK+V3B0=';
const BUILDIUM_BASE_URL = 'https://api.buildium.com';

async function testBuildiumConnection() {
  console.log('🔍 Testing Buildium API connection...');
  console.log('');
  
  // Check credentials
  console.log('Credentials:');
  console.log('BUILDIUM_CLIENT_ID:', BUILDIUM_CLIENT_ID ? '✓ Set' : '❌ Not set');
  console.log('BUILDIUM_API_KEY:', BUILDIUM_API_KEY ? '✓ Set' : '❌ Not set');
  console.log('');
  
  try {
    // Test basic API connectivity by fetching properties
    console.log('🏠 Testing properties API endpoint...');
    
    const response = await fetch(`${BUILDIUM_BASE_URL}/v1/rentals?limit=5`, {
      method: 'GET',
      headers: {
        'x-buildium-client-id': BUILDIUM_CLIENT_ID,
        'x-buildium-client-secret': BUILDIUM_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    console.log(`Response status: ${response.status} ${response.statusText}`);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      throw new Error(`Buildium API request failed: ${response.status} ${response.statusText}`);
    }

    const properties = await response.json();
    console.log(`✅ Success! Found ${properties.length} properties`);
    
    if (properties.length > 0) {
      const firstProperty = properties[0];
      console.log(`First property: ${firstProperty.Name || 'Unnamed'} (ID: ${firstProperty.Id})`);
      console.log(`Type: ${firstProperty.RentalSubType || firstProperty.PropertyType || 'Unknown'}`);
    }
    
    console.log('');
    
    // Test units endpoint
    console.log('🏠 Testing units API endpoint...');
    const unitsResponse = await fetch(`${BUILDIUM_BASE_URL}/v1/rentals/units?limit=10`, {
      method: 'GET',
      headers: {
        'x-buildium-client-id': BUILDIUM_CLIENT_ID,
        'x-buildium-client-secret': BUILDIUM_API_KEY,
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });

    if (unitsResponse.ok) {
      const units = await unitsResponse.json();
      console.log(`✅ Success! Found ${units.length} units`);
      
      if (units.length > 0) {
        const occupiedCount = units.filter(u => u.IsUnitOccupied).length;
        const occupancyRate = ((occupiedCount / units.length) * 100).toFixed(1);
        console.log(`Sample units: ${occupiedCount}/${units.length} occupied (${occupancyRate}% occupancy in sample)`);
      }
    } else {
      console.log(`Units endpoint returned ${unitsResponse.status}, but properties worked`);
    }
    
    console.log('');
    console.log('🎉 Buildium API connection test completed successfully!');
    return true;
    
  } catch (error) {
    console.error('❌ Buildium API test failed:', error.message);
    console.error('');
    
    if (error.message.includes('401')) {
      console.log('💡 This looks like an authentication issue.');
      console.log('Please check your BUILDIUM_CLIENT_ID and BUILDIUM_API_KEY values.');
    } else if (error.message.includes('404')) {
      console.log('💡 This might be an endpoint issue.');
      console.log('The API credentials seem valid but the endpoint might not exist.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('network')) {
      console.log('💡 This looks like a network connectivity issue.');
      console.log('Please check your internet connection.');
    }
    
    return false;
  }
}

testBuildiumConnection().then(success => {
  process.exit(success ? 0 : 1);
}).catch(console.error);
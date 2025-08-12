// Detailed examination of Buildium data structures
const BUILDIUM_CLIENT_ID = '2f088123-7525-4c95-8c41-30edb9a1da51';
const BUILDIUM_API_KEY = 'jBbIs4mYxqBaiZ4dTEkDW7bDjbA6meCz2W9nPK+V3B0=';
const BUILDIUM_BASE_URL = 'https://api.buildium.com';

async function makeRequest(endpoint) {
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
}

async function examineDataStructures() {
  console.log('🔍 DETAILED BUILDIUM DATA STRUCTURE EXAMINATION');
  console.log('=' * 70);

  try {
    // Get sample data
    console.log('\n1. 🏠 PROPERTIES STRUCTURE:');
    const properties = await makeRequest('/v1/rentals?limit=2');
    console.log(JSON.stringify(properties[0], null, 2));

    console.log('\n2. 🏘️ UNITS STRUCTURE:');
    const units = await makeRequest('/v1/rentals/units?limit=2');
    console.log(JSON.stringify(units[0], null, 2));

    console.log('\n3. 📋 LEASES STRUCTURE:');
    const leases = await makeRequest('/v1/leases?limit=2');
    console.log(JSON.stringify(leases[0], null, 2));

    console.log('\n4. 👤 OWNERS STRUCTURE:');
    const owners = await makeRequest('/v1/rentals/owners?limit=1');
    console.log(JSON.stringify(owners[0], null, 2));

    console.log('\n5. 🔧 WORK ORDERS STRUCTURE:');
    const workOrders = await makeRequest('/v1/workorders?limit=1');
    console.log(JSON.stringify(workOrders[0], null, 2));

    console.log('\n6. 🏚️ VACANT UNITS CHECK:');
    const vacantUnits = await makeRequest('/v1/rentals/units?IsOccupied=false&limit=3');
    console.log(`Found ${vacantUnits.length} vacant units`);
    if (vacantUnits.length > 0) {
      console.log('First vacant unit:');
      console.log(JSON.stringify(vacantUnits[0], null, 2));
    }

    console.log('\n7. 💰 RENT ANALYSIS:');
    const allUnits = await makeRequest('/v1/rentals/units?limit=20');
    const rentData = allUnits.map(unit => ({
      id: unit.Id,
      rent: unit.MarketRent,
      actualRent: unit.Rent || unit.ActualRent || 'N/A'
    }));
    console.log('Rent data sample:', rentData.slice(0, 5));

    console.log('\n8. 📅 LEASE ANALYSIS:');
    const allLeases = await makeRequest('/v1/leases?limit=20');
    const leaseAnalysis = allLeases.map(lease => ({
      id: lease.Id,
      status: lease.LeaseStatus,
      termType: lease.TermType,
      leaseType: lease.LeaseType,
      fromDate: lease.LeaseFromDate,
      toDate: lease.LeaseToDate,
      moveIn: lease.MoveInDate,
      moveOut: lease.MoveOutDate
    }));
    console.log('Lease data analysis:');
    leaseAnalysis.slice(0, 3).forEach(lease => {
      console.log(JSON.stringify(lease, null, 2));
    });

    // Analyze lease statuses
    const leaseStatuses = [...new Set(allLeases.map(l => l.LeaseStatus))];
    const termTypes = [...new Set(allLeases.map(l => l.TermType))];
    const leaseTypes = [...new Set(allLeases.map(l => l.LeaseType))];
    
    console.log('\n9. 📊 LEASE CATEGORIZATION:');
    console.log('Unique Lease Statuses:', leaseStatuses);
    console.log('Unique Term Types:', termTypes);  
    console.log('Unique Lease Types:', leaseTypes);

    console.log('\n10. 🏗️ PROPERTY TYPE ANALYSIS:');
    const propTypes = [...new Set(properties.map(p => p.RentalType))];
    const rentalSubTypes = [...new Set(properties.map(p => p.RentalSubType))];
    console.log('Rental Types:', propTypes);
    console.log('Rental Sub Types:', rentalSubTypes);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

examineDataStructures().catch(console.error);
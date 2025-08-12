// Test metrics with FULL Buildium dataset using proper pagination
const BUILDIUM_CLIENT_ID = '2f088123-7525-4c95-8c41-30edb9a1da51';
const BUILDIUM_API_KEY = 'jBbIs4mYxqBaiZ4dTEkDW7bDjbA6meCz2W9nPK+V3B0=';
const BUILDIUM_BASE_URL = 'https://api.buildium.com';

class FullDatasetTester {
  constructor() {
    this.headers = {
      'x-buildium-client-id': BUILDIUM_CLIENT_ID,
      'x-buildium-client-secret': BUILDIUM_API_KEY,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  async makeRequest(endpoint) {
    try {
      const response = await fetch(`${BUILDIUM_BASE_URL}${endpoint}`, {
        method: 'GET',
        headers: this.headers,
      });

      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }

      const data = await response.json();
      const totalCount = response.headers.get('X-Total-Count');
      return { 
        data, 
        totalCount: totalCount ? parseInt(totalCount) : null 
      };
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
      return null;
    }
  }

  async getAllPaginated(baseEndpoint) {
    const allData = [];
    let offset = 0;
    const limit = 1000; // Buildium's max
    
    console.log(`🔄 Starting pagination for ${baseEndpoint}`);
    
    while (true) {
      const endpoint = `${baseEndpoint}${baseEndpoint.includes('?') ? '&' : '?'}limit=${limit}&offset=${offset}`;
      const result = await this.makeRequest(endpoint);
      
      if (!result || !result.data || result.data.length === 0) {
        console.log(`   📋 No more data at offset ${offset}`);
        break;
      }
      
      allData.push(...result.data);
      console.log(`   📦 Added ${result.data.length} records, total: ${allData.length}`);
      
      // Stop if we got less than the limit (end of data)
      if (result.data.length < limit) {
        console.log(`   ✅ Got ${result.data.length} < ${limit}, pagination complete`);
        break;
      }
      
      // Stop if we've reached the total count
      if (result.totalCount && allData.length >= result.totalCount) {
        console.log(`   ✅ Reached total count ${result.totalCount}`);
        break;
      }
      
      offset += limit;
      
      // Safety break for very large datasets
      if (allData.length > 10000) {
        console.log(`   ⚠️ Safety break at ${allData.length} records`);
        break;
      }
    }
    
    console.log(`✅ Retrieved ${allData.length} total records from ${baseEndpoint}`);
    return allData;
  }

  async testOccupancyWithFullData() {
    console.log('\n🏠 TESTING OCCUPANCY WITH FULL DATASET');
    console.log('=' * 50);
    
    // Get ALL units (2,657 total)
    const allUnits = await this.getAllPaginated('/v1/rentals/units');
    if (!allUnits) return;

    // Get ALL properties for classification (1,123 total)
    const allProperties = await this.getAllPaginated('/v1/rentals');
    if (!allProperties) return;

    console.log(`📊 Full dataset: ${allProperties.length} properties, ${allUnits.length} units`);
    
    // Create property type mapping
    const propertyTypeMap = new Map();
    let sfrPropertyCount = 0;
    let mfPropertyCount = 0;
    
    allProperties.forEach(property => {
      const rentalSubType = property.RentalSubType || '';
      const isSFR = rentalSubType === 'SingleFamily';
      
      propertyTypeMap.set(property.Id, isSFR ? 'sfr' : 'mf');
      
      if (isSFR) {
        sfrPropertyCount++;
      } else {
        mfPropertyCount++;
      }
    });
    
    console.log(`🏗️ Property types: ${sfrPropertyCount} SFR, ${mfPropertyCount} MF`);
    
    // Calculate occupancy from ALL units
    let totalUnits = allUnits.length;
    let occupiedUnits = 0;
    let sfrUnits = 0;
    let sfrOccupied = 0;
    let mfUnits = 0;
    let mfOccupied = 0;
    let totalRent = 0;
    let occupiedRentCount = 0;
    
    allUnits.forEach(unit => {
      const propertyId = unit.PropertyId || unit.RentalPropertyId;
      const propertyType = propertyTypeMap.get(propertyId) || 'mf';
      const isOccupied = unit.IsOccupied === true;
      const rent = unit.MarketRent || unit.Rent || 0;
      
      if (propertyType === 'sfr') {
        sfrUnits++;
        if (isOccupied) {
          sfrOccupied++;
          occupiedUnits++;
          if (rent > 0) {
            totalRent += rent;
            occupiedRentCount++;
          }
        }
      } else {
        mfUnits++;
        if (isOccupied) {
          mfOccupied++;
          occupiedUnits++;
          if (rent > 0) {
            totalRent += rent;
            occupiedRentCount++;
          }
        }
      }
    });
    
    const totalOccupancy = (occupiedUnits / totalUnits * 100).toFixed(1);
    const sfrOccupancy = (sfrOccupied / sfrUnits * 100).toFixed(1);
    const mfOccupancy = (mfOccupied / mfUnits * 100).toFixed(1);
    const avgRent = occupiedRentCount > 0 ? Math.round(totalRent / occupiedRentCount) : 0;
    
    console.log(`📈 REAL OCCUPANCY RATES:`);
    console.log(`   Total: ${totalOccupancy}% (${occupiedUnits}/${totalUnits})`);
    console.log(`   SFR: ${sfrOccupancy}% (${sfrOccupied}/${sfrUnits})`);
    console.log(`   MF: ${mfOccupancy}% (${mfOccupied}/${mfUnits})`);
    console.log(`   Total Rent Roll: $${totalRent.toLocaleString()}`);
    console.log(`   Average Rent: $${avgRent}`);
    
    return {
      totalOccupancy: parseFloat(totalOccupancy),
      sfrOccupancy: parseFloat(sfrOccupancy), 
      mfOccupancy: parseFloat(mfOccupancy),
      totalUnits,
      occupiedUnits,
      totalRent,
      avgRent
    };
  }

  async testMonthToMonthWithFullData() {
    console.log('\n📅 TESTING MONTH-TO-MONTH WITH FULL DATASET');
    console.log('=' * 50);
    
    // Get first 1000 leases to start (4,081 total available)
    console.log('⚠️ Getting first 1000 leases (of 4,081 total) to avoid overwhelming system');
    const leases = await this.makeRequest('/v1/leases?limit=1000');
    if (!leases) return;
    
    console.log(`📊 Analyzing ${leases.data.length} leases (sample)`);
    
    const activeLeases = leases.data.filter(lease => 
      lease.LeaseStatus === 'Active' || lease.LeaseStatus === 'Current'
    );
    
    let monthToMonthCount = 0;
    const termTypes = new Set();
    
    activeLeases.forEach(lease => {
      // Collect all term types to see what's available
      if (lease.TermType) {
        termTypes.add(lease.TermType);
      }
      
      // Count month-to-month based on TermType
      if (lease.TermType === 'MonthToMonth') {
        monthToMonthCount++;
      }
    });
    
    const percentage = activeLeases.length > 0 ? 
      (monthToMonthCount / activeLeases.length * 100).toFixed(1) : 0;
    
    console.log(`📈 MONTH-TO-MONTH RESULTS:`);
    console.log(`   Total Active Leases: ${activeLeases.length}`);
    console.log(`   Month-to-Month: ${monthToMonthCount} (${percentage}%)`);
    console.log(`   Available Term Types: ${Array.from(termTypes).join(', ')}`);
    
    return {
      activeLeases: activeLeases.length,
      monthToMonthCount,
      percentage: parseFloat(percentage)
    };
  }

  async runFullDatasetTest() {
    console.log('🚀 TESTING WITH FULL BUILDIUM DATASET');
    console.log('Real totals: 1,123 properties, 2,657 units, 4,081 leases');
    console.log('=' * 60);
    
    try {
      const occupancyResults = await this.testOccupancyWithFullData();
      const monthToMonthResults = await this.testMonthToMonthWithFullData();
      
      console.log('\n🎯 CORRECTED RESULTS SUMMARY');
      console.log('=' * 60);
      console.log(`✅ REAL Occupancy: ${occupancyResults?.totalOccupancy || 0}% (vs previous ~55% - WRONG!)`);
      console.log(`✅ REAL SFR Occupancy: ${occupancyResults?.sfrOccupancy || 0}%`);
      console.log(`✅ REAL MF Occupancy: ${occupancyResults?.mfOccupancy || 0}%`);
      console.log(`✅ REAL Total Rent Roll: $${occupancyResults?.totalRent?.toLocaleString() || 0}`);
      console.log(`✅ REAL Month-to-Month: ${monthToMonthResults?.monthToMonthCount || 0} (${monthToMonthResults?.percentage || 0}%)`);
      
      console.log('\n⚠️ PREVIOUS CALCULATIONS WERE WRONG DUE TO PAGINATION BUG!');
      console.log('Need to fix buildium-api.ts pagination and recalculate everything.');
      
    } catch (error) {
      console.error('❌ Error in full dataset test:', error);
    }
  }
}

const tester = new FullDatasetTester();
tester.runFullDatasetTest().catch(console.error);
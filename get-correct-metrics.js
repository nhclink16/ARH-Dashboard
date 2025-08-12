// Get CORRECT metrics with full dataset and proper field checking
const BUILDIUM_CLIENT_ID = '2f088123-7525-4c95-8c41-30edb9a1da51';
const BUILDIUM_API_KEY = 'jBbIs4mYxqBaiZ4dTEkDW7bDjbA6meCz2W9nPK+V3B0=';
const BUILDIUM_BASE_URL = 'https://api.buildium.com';

class CorrectMetricsCalculator {
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

  async getAllPaginated(baseEndpoint, maxRecords = 5000) {
    const allData = [];
    let offset = 0;
    const limit = 1000;
    
    console.log(`🔄 Fetching all data from ${baseEndpoint}`);
    
    while (true) {
      const endpoint = `${baseEndpoint}${baseEndpoint.includes('?') ? '&' : '?'}limit=${limit}&offset=${offset}`;
      const result = await this.makeRequest(endpoint);
      
      if (!result || !result.data || result.data.length === 0) {
        break;
      }
      
      allData.push(...result.data);
      console.log(`   📦 ${allData.length} records so far...`);
      
      if (result.data.length < limit || allData.length >= maxRecords) {
        break;
      }
      
      if (result.totalCount && allData.length >= result.totalCount) {
        break;
      }
      
      offset += limit;
    }
    
    console.log(`✅ Got ${allData.length} total records`);
    return allData;
  }

  async calculateCorrectOccupancyAndRent() {
    console.log('🏠 CALCULATING CORRECT OCCUPANCY AND RENT METRICS');
    console.log('=' * 60);
    
    // Get all units and properties
    const [allUnits, allProperties] = await Promise.all([
      this.getAllPaginated('/v1/rentals/units'),
      this.getAllPaginated('/v1/rentals')
    ]);
    
    if (!allUnits || !allProperties) {
      console.error('Failed to fetch data');
      return;
    }
    
    // Create property type mapping
    const propertyTypeMap = new Map();
    let sfrPropertyCount = 0;
    let mfPropertyCount = 0;
    
    allProperties.forEach(property => {
      const rentalSubType = property.RentalSubType || '';
      const isSFR = rentalSubType === 'SingleFamily';
      
      propertyTypeMap.set(property.Id, isSFR ? 'SFR' : 'MF');
      
      if (isSFR) {
        sfrPropertyCount++;
      } else {
        mfPropertyCount++;
      }
    });
    
    console.log(`🏗️ Property classification: ${sfrPropertyCount} SFR, ${mfPropertyCount} MF`);
    
    // Calculate metrics with CORRECT field checking
    const stats = {
      total: { units: 0, occupied: 0, totalRent: 0, rentCount: 0 },
      SFR: { units: 0, occupied: 0, totalRent: 0, rentCount: 0 },
      MF: { units: 0, occupied: 0, totalRent: 0, rentCount: 0 }
    };
    
    // Debug first few units to verify field access
    console.log('\n🔍 Debugging first 5 units:');
    allUnits.slice(0, 5).forEach((unit, index) => {
      const propertyType = propertyTypeMap.get(unit.PropertyId) || 'MF';
      console.log(`Unit ${index + 1}: PropertyType=${propertyType}, IsUnitOccupied=${unit.IsUnitOccupied}, MarketRent=${unit.MarketRent}`);
    });
    
    // Process all units
    allUnits.forEach(unit => {
      const propertyType = propertyTypeMap.get(unit.PropertyId) || 'MF';
      const isOccupied = unit.IsUnitOccupied === true; // Explicit boolean check
      const rent = unit.MarketRent || 0;
      
      // Count all units
      stats.total.units++;
      stats[propertyType].units++;
      
      if (isOccupied) {
        stats.total.occupied++;
        stats[propertyType].occupied++;
        
        if (rent > 0) {
          stats.total.totalRent += rent;
          stats.total.rentCount++;
          stats[propertyType].totalRent += rent;
          stats[propertyType].rentCount++;
        }
      }
    });
    
    // Calculate final metrics
    const results = {
      occupancy: {
        total: (stats.total.occupied / stats.total.units * 100).toFixed(1),
        SFR: (stats.SFR.occupied / stats.SFR.units * 100).toFixed(1),
        MF: (stats.MF.occupied / stats.MF.units * 100).toFixed(1)
      },
      units: {
        total: stats.total.units,
        totalOccupied: stats.total.occupied,
        SFR: stats.SFR.units,
        SFROccupied: stats.SFR.occupied,
        MF: stats.MF.units,
        MFOccupied: stats.MF.occupied
      },
      rent: {
        totalRentRoll: stats.total.totalRent,
        averageRent: {
          total: stats.total.rentCount > 0 ? Math.round(stats.total.totalRent / stats.total.rentCount) : 0,
          SFR: stats.SFR.rentCount > 0 ? Math.round(stats.SFR.totalRent / stats.SFR.rentCount) : 0,
          MF: stats.MF.rentCount > 0 ? Math.round(stats.MF.totalRent / stats.MF.rentCount) : 0
        }
      }
    };
    
    console.log('\n📊 CORRECT RESULTS:');
    console.log(`💼 Total Units: ${results.units.total}`);
    console.log(`🏠 Occupancy: ${results.occupancy.total}% (${results.units.totalOccupied}/${results.units.total})`);
    console.log(`🏘️ SFR: ${results.occupancy.SFR}% (${results.units.SFROccupied}/${results.units.SFR})`);
    console.log(`🏢 MF: ${results.occupancy.MF}% (${results.units.MFOccupied}/${results.units.MF})`);
    console.log(`💰 Total Rent Roll: $${results.rent.totalRentRoll.toLocaleString()}`);
    console.log(`💵 Average Rent - Total: $${results.rent.averageRent.total}`);
    console.log(`💵 Average Rent - SFR: $${results.rent.averageRent.SFR}`);
    console.log(`💵 Average Rent - MF: $${results.rent.averageRent.MF}`);
    
    return results;
  }

  async getMonthToMonthMetrics() {
    console.log('\n📅 CALCULATING MONTH-TO-MONTH METRICS');
    console.log('=' * 60);
    
    // Get all leases (4,081 total - this will take a moment)
    console.log('⚠️ Note: Getting all 4,081 leases may take 30-60 seconds...');
    const allLeases = await this.getAllPaginated('/v1/leases', 4100);
    
    if (!allLeases) {
      console.error('Failed to fetch leases');
      return;
    }
    
    // Filter active leases
    const activeLeases = allLeases.filter(lease => 
      lease.LeaseStatus === 'Active' || lease.LeaseStatus === 'Current'
    );
    
    // Count month-to-month
    let monthToMonthCount = 0;
    const termTypes = new Set();
    
    activeLeases.forEach(lease => {
      if (lease.TermType) {
        termTypes.add(lease.TermType);
      }
      
      if (lease.TermType === 'MonthToMonth') {
        monthToMonthCount++;
      }
    });
    
    const percentage = activeLeases.length > 0 ? 
      (monthToMonthCount / activeLeases.length * 100).toFixed(1) : 0;
    
    console.log(`📊 MONTH-TO-MONTH RESULTS:`);
    console.log(`   Total Leases: ${allLeases.length}`);
    console.log(`   Active Leases: ${activeLeases.length}`);
    console.log(`   Month-to-Month: ${monthToMonthCount} (${percentage}%)`);
    console.log(`   Available Term Types: ${Array.from(termTypes).join(', ')}`);
    
    return {
      totalLeases: allLeases.length,
      activeLeases: activeLeases.length,
      monthToMonthCount,
      percentage: parseFloat(percentage)
    };
  }

  async runCorrectCalculations() {
    console.log('🎯 GETTING CORRECT METRICS FROM FULL BUILDIUM DATASET');
    console.log('Dataset: 1,123 properties, 2,657 units, 4,081 leases');
    console.log('=' * 70);
    
    try {
      const occupancyResults = await this.calculateCorrectOccupancyAndRent();
      const monthToMonthResults = await this.getMonthToMonthMetrics();
      
      console.log('\n🏆 FINAL CORRECT RESULTS');
      console.log('=' * 70);
      console.log('These are the REAL metrics from the full Buildium dataset:');
      console.log('');
      console.log(`✅ Total Occupancy: ${occupancyResults?.occupancy.total}%`);
      console.log(`✅ SFR Occupancy: ${occupancyResults?.occupancy.SFR}%`);
      console.log(`✅ MF Occupancy: ${occupancyResults?.occupancy.MF}%`);
      console.log(`✅ Total Rent Roll: $${occupancyResults?.rent.totalRentRoll.toLocaleString()}`);
      console.log(`✅ Average Rent: $${occupancyResults?.rent.averageRent.total}`);
      console.log(`✅ Month-to-Month: ${monthToMonthResults?.monthToMonthCount} (${monthToMonthResults?.percentage}%)`);
      
      console.log('\n🔄 Next: Update buildium-api.ts with these correct calculations');
      
    } catch (error) {
      console.error('❌ Error in calculations:', error);
    }
  }
}

const calculator = new CorrectMetricsCalculator();
calculator.runCorrectCalculations().catch(console.error);
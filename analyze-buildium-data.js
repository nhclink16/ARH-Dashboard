// Comprehensive Buildium API data analysis
const BUILDIUM_CLIENT_ID = '2f088123-7525-4c95-8c41-30edb9a1da51';
const BUILDIUM_API_KEY = 'jBbIs4mYxqBaiZ4dTEkDW7bDjbA6meCz2W9nPK+V3B0=';
const BUILDIUM_BASE_URL = 'https://api.buildium.com';

class BuildiumDataAnalyzer {
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
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
      return null;
    }
  }

  async analyzeEndpoint(endpoint, description) {
    console.log(`\n🔍 Testing: ${description}`);
    console.log(`   Endpoint: ${endpoint}`);
    
    const data = await this.makeRequest(endpoint);
    
    if (!data) {
      console.log(`   ❌ Failed to fetch data`);
      return null;
    }

    console.log(`   ✅ Success! Found ${data.length || 'N/A'} records`);
    
    if (Array.isArray(data) && data.length > 0) {
      console.log(`   📋 Sample fields:`, Object.keys(data[0]).slice(0, 10));
      return data;
    } else if (typeof data === 'object') {
      console.log(`   📋 Object fields:`, Object.keys(data).slice(0, 10));
      return data;
    }
    
    return data;
  }

  async runFullAnalysis() {
    console.log('🚀 COMPREHENSIVE BUILDIUM DATA ANALYSIS');
    console.log('=' * 60);
    
    // Core property data
    const properties = await this.analyzeEndpoint('/v1/rentals?limit=5', 'Properties');
    const units = await this.analyzeEndpoint('/v1/rentals/units?limit=10', 'Units'); 
    
    // Lease data for occupancy metrics
    const leases = await this.analyzeEndpoint('/v1/leases?limit=10', 'Leases');
    
    // Owner/tenant data
    const owners = await this.analyzeEndpoint('/v1/rentals/owners?limit=5', 'Property Owners');
    const tenants = await this.analyzeEndpoint('/v1/tenants?limit=5', 'Tenants');
    
    // Financial data
    const bankAccounts = await this.analyzeEndpoint('/v1/bankaccounts?limit=5', 'Bank Accounts');
    const transactions = await this.analyzeEndpoint('/v1/transactions?limit=10', 'Transactions');
    
    // Work order data for maintenance
    const workOrders = await this.analyzeEndpoint('/v1/workorders?limit=5', 'Work Orders');
    
    // Vacancy data
    const vacancies = await this.analyzeEndpoint('/v1/rentals/units?IsOccupied=false&limit=10', 'Vacant Units');
    
    // Rental history
    const rentalHistory = await this.analyzeEndpoint('/v1/rentals/units/rentalhistory?limit=5', 'Rental History');
    
    console.log(`\n\n📊 METRIC FEASIBILITY ANALYSIS`);
    console.log('=' * 60);
    
    // Analyze what metrics we can calculate
    this.analyzeMetricFeasibility({
      properties,
      units, 
      leases,
      owners,
      tenants,
      workOrders,
      vacancies,
      rentalHistory
    });
  }

  analyzeMetricFeasibility(data) {
    console.log('\n✅ FEASIBLE METRICS (with available data):');
    
    // Occupancy Rate
    if (data.units) {
      console.log('   🏠 Occupancy Rate: YES - units have IsOccupied field');
    }
    
    // Rent metrics
    if (data.units) {
      console.log('   💰 Rent Metrics: YES - units likely have rent amounts');
    }
    
    // Lease terms
    if (data.leases) {
      console.log('   📅 Occupancy Term: YES - leases have date fields');
    }
    
    // Early terminations  
    if (data.leases) {
      console.log('   🚪 Early Terminations: YES - can calculate from lease dates');
    }
    
    // Month-to-month
    if (data.leases) {
      console.log('   📆 Month-to-Month: YES - leases likely have term type');
    }
    
    // Owner data
    if (data.owners) {
      console.log('   👥 Owner Metrics: YES - owner data available');
    }
    
    // Days on market (vacancy duration)
    if (data.vacancies || data.rentalHistory) {
      console.log('   📈 Days on Market: MAYBE - depends on vacancy date tracking');
    }
    
    // Leases signed
    if (data.leases) {
      console.log('   📝 Leases Signed: YES - can filter by date range');
    }
    
    console.log('\n❓ UNCERTAIN METRICS (need to investigate):');
    console.log('   ⭐ Google Reviews: NOT IN BUILDIUM - need external API');
    console.log('   📍 Vacancy Duration Distribution: Depends on historical data');
    
    console.log('\n🔍 NEXT STEPS:');
    console.log('   1. Examine sample data structure for each endpoint');
    console.log('   2. Verify field names and data types');
    console.log('   3. Test calculations on small data sets');
    console.log('   4. Handle edge cases (missing data, etc.)');
  }
}

// Run the analysis
const analyzer = new BuildiumDataAnalyzer();
analyzer.runFullAnalysis().catch(console.error);
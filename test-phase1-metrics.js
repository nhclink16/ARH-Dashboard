// Test Phase 1 Metrics Implementation
const BUILDIUM_CLIENT_ID = '2f088123-7525-4c95-8c41-30edb9a1da51';
const BUILDIUM_API_KEY = 'jBbIs4mYxqBaiZ4dTEkDW7bDjbA6meCz2W9nPK+V3B0=';
const BUILDIUM_BASE_URL = 'https://api.buildium.com';

class Phase1MetricsTester {
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

      return await response.json();
    } catch (error) {
      console.error(`❌ ${endpoint}: ${error.message}`);
      return null;
    }
  }

  async testMonthToMonthMetric() {
    console.log('\n🔍 TESTING MONTH-TO-MONTH METRIC');
    console.log('=' * 50);
    
    const leases = await this.makeRequest('/v1/leases?limit=100');
    if (!leases) return;

    console.log(`📊 Found ${leases.length} leases to analyze`);
    
    // Analyze term types
    const termTypes = leases.map(l => l.TermType).filter(Boolean);
    const uniqueTermTypes = [...new Set(termTypes)];
    
    console.log('🏷️ Available Term Types:', uniqueTermTypes);
    
    // Count month-to-month leases
    const monthToMonthVariations = ['MonthToMonth', 'Month-to-Month', 'MTM', 'Monthly'];
    let monthToMonthCount = 0;
    let activeLeaseCount = 0;
    
    leases.forEach(lease => {
      if (lease.LeaseStatus === 'Active' || lease.LeaseStatus === 'Current') {
        activeLeaseCount++;
        
        // Check if term type indicates month-to-month
        if (lease.TermType && monthToMonthVariations.some(variation => 
          lease.TermType.toLowerCase().includes(variation.toLowerCase())
        )) {
          monthToMonthCount++;
        }
      }
    });
    
    const monthToMonthPercent = activeLeaseCount > 0 ? (monthToMonthCount / activeLeaseCount) * 100 : 0;
    
    console.log(`📈 Results:`);
    console.log(`   Active Leases: ${activeLeaseCount}`);
    console.log(`   Month-to-Month Leases: ${monthToMonthCount}`);
    console.log(`   Month-to-Month Percentage: ${monthToMonthPercent.toFixed(1)}%`);
    
    // Show sample data
    if (leases.length > 0) {
      console.log('\n📋 Sample Lease Data:');
      const sampleLease = leases[0];
      console.log(`   LeaseStatus: ${sampleLease.LeaseStatus}`);
      console.log(`   TermType: ${sampleLease.TermType}`);
      console.log(`   LeaseFromDate: ${sampleLease.LeaseFromDate}`);
      console.log(`   LeaseToDate: ${sampleLease.LeaseToDate}`);
    }

    return {
      monthToMonthCount,
      monthToMonthPercent: parseFloat(monthToMonthPercent.toFixed(1)),
      activeLeaseCount
    };
  }

  async testOwnerLengthMetric() {
    console.log('\n🔍 TESTING AVERAGE OWNER LENGTH METRIC');
    console.log('=' * 50);
    
    const owners = await this.makeRequest('/v1/rentals/owners?limit=100');
    if (!owners) return;

    console.log(`👥 Found ${owners.length} owners to analyze`);
    
    // Analyze management agreement dates
    let totalYears = 0;
    let validOwners = 0;
    const currentDate = new Date();
    
    const ownerLengths = [];
    
    owners.forEach(owner => {
      if (owner.ManagementAgreementStartDate) {
        const startDate = new Date(owner.ManagementAgreementStartDate);
        const yearsManaged = (currentDate - startDate) / (1000 * 60 * 60 * 24 * 365.25);
        
        if (yearsManaged >= 0) { // Valid date
          totalYears += yearsManaged;
          validOwners++;
          ownerLengths.push({
            ownerId: owner.Id,
            startDate: owner.ManagementAgreementStartDate,
            yearsManaged: yearsManaged.toFixed(1)
          });
        }
      }
    });
    
    const averageYears = validOwners > 0 ? totalYears / validOwners : 0;
    
    console.log(`📈 Results:`);
    console.log(`   Total Owners: ${owners.length}`);
    console.log(`   Owners with Valid Start Dates: ${validOwners}`);
    console.log(`   Average Owner Length: ${averageYears.toFixed(1)} years`);
    
    // Show sample data
    if (owners.length > 0) {
      console.log('\n📋 Sample Owner Data:');
      const sampleOwner = owners[0];
      console.log(`   Owner ID: ${sampleOwner.Id}`);
      console.log(`   ManagementAgreementStartDate: ${sampleOwner.ManagementAgreementStartDate}`);
      console.log(`   PropertyIds: ${sampleOwner.PropertyIds ? sampleOwner.PropertyIds.length : 'N/A'} properties`);
    }
    
    // Show top 5 longest relationships
    if (ownerLengths.length > 0) {
      console.log('\n🏆 Top 5 Longest Owner Relationships:');
      ownerLengths
        .sort((a, b) => parseFloat(b.yearsManaged) - parseFloat(a.yearsManaged))
        .slice(0, 5)
        .forEach((owner, index) => {
          console.log(`   ${index + 1}. ${owner.yearsManaged} years (since ${owner.startDate})`);
        });
    }

    return {
      totalOwners: owners.length,
      validOwners,
      averageYears: parseFloat(averageYears.toFixed(1))
    };
  }

  async testLeasesSignedMetric() {
    console.log('\n🔍 TESTING LEASES SIGNED THIS MONTH METRIC');
    console.log('=' * 50);
    
    // Get current month date range
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    console.log(`📅 Current Month: ${firstDayOfMonth.toISOString().slice(0, 10)} to ${lastDayOfMonth.toISOString().slice(0, 10)}`);
    
    // Test different date filtering approaches
    const endpoints = [
      `/v1/leases?CreatedDateTimeFrom=${firstDayOfMonth.toISOString()}`,
      `/v1/leases?limit=200` // Get larger sample to filter manually
    ];
    
    let leasesThisMonth = { total: 0, sfr: 0, mf: 0 };
    
    for (let i = 0; i < endpoints.length; i++) {
      console.log(`\n🔍 Testing approach ${i + 1}:`);
      const leases = await this.makeRequest(endpoints[i]);
      if (!leases) continue;
      
      console.log(`   Retrieved ${leases.length} leases`);
      
      // Filter by move-in date or creation date for current month
      const thisMonthLeases = leases.filter(lease => {
        const moveInDate = lease.MoveInDate ? new Date(lease.MoveInDate) : null;
        const createdDate = lease.CreatedDateTime ? new Date(lease.CreatedDateTime) : null;
        
        // Check if move-in date is in current month
        if (moveInDate && moveInDate >= firstDayOfMonth && moveInDate <= lastDayOfMonth) {
          return true;
        }
        
        // Fallback to creation date
        if (createdDate && createdDate >= firstDayOfMonth && createdDate <= lastDayOfMonth) {
          return true;
        }
        
        return false;
      });
      
      console.log(`   Leases signed this month: ${thisMonthLeases.length}`);
      
      if (thisMonthLeases.length > 0) {
        // Get property information to classify SFR vs MF
        const propertyIds = [...new Set(thisMonthLeases.map(l => l.PropertyId).filter(Boolean))];
        console.log(`   Properties involved: ${propertyIds.length}`);
        
        // For now, just count total (would need property lookup for SFR/MF breakdown)
        leasesThisMonth.total = thisMonthLeases.length;
        
        // Show sample lease data
        console.log('\n📋 Sample Recent Lease:');
        const sampleLease = thisMonthLeases[0];
        console.log(`   Lease ID: ${sampleLease.Id}`);
        console.log(`   MoveInDate: ${sampleLease.MoveInDate}`);
        console.log(`   CreatedDateTime: ${sampleLease.CreatedDateTime}`);
        console.log(`   PropertyId: ${sampleLease.PropertyId}`);
        console.log(`   LeaseStatus: ${sampleLease.LeaseStatus}`);
        
        break; // Use the first successful approach
      }
    }
    
    console.log(`📈 Results:`);
    console.log(`   Total Leases Signed This Month: ${leasesThisMonth.total}`);
    console.log(`   SFR Leases: ${leasesThisMonth.sfr} (needs property classification)`);
    console.log(`   MF Leases: ${leasesThisMonth.mf} (needs property classification)`);

    return leasesThisMonth;
  }

  async runAllPhase1Tests() {
    console.log('🚀 PHASE 1 METRICS TESTING');
    console.log('=' * 60);
    console.log('Testing the 3 easiest metrics to implement first');
    
    try {
      // Test all three metrics
      const monthToMonthResults = await this.testMonthToMonthMetric();
      const ownerLengthResults = await this.testOwnerLengthMetric();
      const leasesSignedResults = await this.testLeasesSignedMetric();
      
      console.log('\n🎯 PHASE 1 RESULTS SUMMARY');
      console.log('=' * 60);
      console.log(`✅ Month-to-Month: ${monthToMonthResults?.monthToMonthCount || 0} residents (${monthToMonthResults?.monthToMonthPercent || 0}%)`);
      console.log(`✅ Average Owner Length: ${ownerLengthResults?.averageYears || 0} years`);
      console.log(`✅ Leases Signed This Month: ${leasesSignedResults?.total || 0} leases`);
      
      console.log('\n🔄 NEXT STEPS:');
      console.log('1. Implement these calculations in buildium-api.ts');
      console.log('2. Add refresh methods in supabase-storage.ts');
      console.log('3. Test with dashboard refresh buttons');
      console.log('4. Move to Phase 2 metrics (occupancy term, early terminations, outside owners)');
      
      return {
        monthToMonth: monthToMonthResults,
        ownerLength: ownerLengthResults,
        leasesSigned: leasesSignedResults
      };
      
    } catch (error) {
      console.error('❌ Error in Phase 1 testing:', error);
    }
  }
}

// Run the comprehensive test
const tester = new Phase1MetricsTester();
tester.runAllPhase1Tests().catch(console.error);
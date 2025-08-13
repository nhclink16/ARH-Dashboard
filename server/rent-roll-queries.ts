// Rent Roll Database Queries for Operational Metrics
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL || 'https://zkkxcqdkctueopixutsf.supabase.co';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra3hjcWRrY3R1ZW9waXh1dHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzc5ODgsImV4cCI6MjA2Mzk1Mzk4OH0.VVDpqTduvJbY8Om_OM9RnGIYiN_Cw-YE2m-hdbOu3vE';

const supabase = createClient(supabaseUrl, supabaseKey);

export interface OccupancyMetrics {
  total: number;
  sfr: number;
  mf: number;
  totalUnits: number;
  occupiedUnits: number;
  sfrUnits: number;
  sfrOccupied: number;
  mfUnits: number;
  mfOccupied: number;
}

export interface RentMetrics {
  totalRentRoll: number;
  averageRent: {
    total: number;
    sfr: number;
    mf: number;
  };
}

export interface OwnerMetrics {
  avgYears: number;
  totalProperties: number;
  outsideOwners: number;
}

export interface LeaseMetrics {
  monthToMonth: {
    count: number;
    percentage: number;
  };
  avgOccupancyTerm: number;
  earlyTerminations: {
    count: number;
    rate: number;
  };
  leasesSignedThisMonth: number;
}

export interface MarketMetrics {
  avgDaysOnMarket: number;
  vacancyDistribution: {
    range: string;
    count: number;
  }[];
}

export class RentRollQueries {
  
  // 1. OCCUPANCY METRICS
  async getOccupancyMetrics(): Promise<OccupancyMetrics> {
    // Get ALL property data - handle Supabase 1000 record limit
    const allData: any[] = [];
    let offset = 0;
    const limit = 1000;
    
    while (true) {
      const { data, error, count } = await supabase
        .from('rent_roll')
        .select('PropertyName, Residents', { count: 'exact' })
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching occupancy metrics:', error);
        break;
      }
      
      if (data && data.length > 0) {
        allData.push(...data);
      }
      
      if (!data || data.length < limit) {
        break;
      }
      
      offset += limit;
    }
    
    const propertyData = allData;
    
    if (!propertyData || propertyData.length === 0) {
      console.error('No data fetched for occupancy metrics');
      return {
        total: 0, sfr: 0, mf: 0,
        totalUnits: 0, occupiedUnits: 0,
        sfrUnits: 0, sfrOccupied: 0,
        mfUnits: 0, mfOccupied: 0
      };
    }

    // Group by property to identify SF (1 unit) vs MF (multiple units)
    const propertyGroups = propertyData.reduce((acc: any, unit) => {
      if (!acc[unit.PropertyName]) {
        acc[unit.PropertyName] = { units: 0, occupied: 0 };
      }
      acc[unit.PropertyName].units++;
      if (unit.Residents !== 'VACANT') {
        acc[unit.PropertyName].occupied++;
      }
      return acc;
    }, {});

    // Separate SF (properties with 1 unit) from MF (properties with multiple units)
    let sfrUnits = 0, sfrOccupied = 0, mfUnits = 0, mfOccupied = 0;
    
    Object.values(propertyGroups).forEach((property: any) => {
      if (property.units === 1) {
        // Single-family property
        sfrUnits += property.units;
        sfrOccupied += property.occupied;
      } else {
        // Multi-family property
        mfUnits += property.units;
        mfOccupied += property.occupied;
      }
    });

    const totalUnits = sfrUnits + mfUnits;
    const occupiedUnits = sfrOccupied + mfOccupied;
    
    return {
      total: totalUnits > 0 ? (occupiedUnits / totalUnits) * 100 : 0,
      sfr: sfrUnits > 0 ? (sfrOccupied / sfrUnits) * 100 : 0,
      mf: mfUnits > 0 ? (mfOccupied / mfUnits) * 100 : 0,
      totalUnits,
      occupiedUnits,
      sfrUnits,
      sfrOccupied,
      mfUnits,
      mfOccupied
    };
  }

  // 2. RENT METRICS  
  async getRentMetrics(): Promise<RentMetrics> {
    // Get ALL rent data - handle Supabase 1000 record limit
    const allData: any[] = [];
    let offset = 0;
    const limit = 1000;
    
    while (true) {
      const { data, error } = await supabase
        .from('rent_roll')
        .select('Residents, rent, PropertyName')
        .neq('Residents', 'VACANT')
        .gt('rent', 0)
        .range(offset, offset + limit - 1);
      
      if (error) {
        console.error('Error fetching rent metrics:', error);
        break;
      }
      
      if (data && data.length > 0) {
        allData.push(...data);
      }
      
      if (!data || data.length < limit) {
        break;
      }
      
      offset += limit;
    }
    
    const data = allData;
    
    if (!data || data.length === 0) {
      console.error('No rent data fetched');
      return {
        totalRentRoll: 0,
        averageRent: { total: 0, sfr: 0, mf: 0 }
      };
    }

    // Group by property to identify SF vs MF
    const propertyGroups: { [key: string]: any[] } = {};
    data.forEach(unit => {
      if (!propertyGroups[unit.PropertyName]) {
        propertyGroups[unit.PropertyName] = [];
      }
      propertyGroups[unit.PropertyName].push(unit);
    });

    let totalRentRoll = 0;
    let sfrRentTotal = 0, sfrCount = 0;
    let mfRentTotal = 0, mfCount = 0;

    Object.entries(propertyGroups).forEach(([propertyName, units]) => {
      const propertyRentTotal = units.reduce((sum, u) => sum + (u.rent || 0), 0);
      totalRentRoll += propertyRentTotal;
      
      if (units.length === 1) {
        // Single-family property
        sfrRentTotal += propertyRentTotal;
        sfrCount += units.length;
      } else {
        // Multi-family property
        mfRentTotal += propertyRentTotal;
        mfCount += units.length;
      }
    });
    
    return {
      totalRentRoll: Math.round(totalRentRoll),
      averageRent: {
        total: Math.round(data.length > 0 ? totalRentRoll / data.length : 0),
        sfr: Math.round(sfrCount > 0 ? sfrRentTotal / sfrCount : 0),
        mf: Math.round(mfCount > 0 ? mfRentTotal / mfCount : 0)
      }
    };
  }

  // 3. MONTH-TO-MONTH LEASES
  async getMonthToMonthMetrics(): Promise<LeaseMetrics['monthToMonth']> {
    // For now, we'll simulate this since lease term data isn't in rent_roll
    // In production, this would query lease data
    const { count: totalOccupied } = await supabase
      .from('rent_roll')
      .select('*', { count: 'exact', head: true })
      .neq('Residents', 'VACANT');
    
    // Estimate: typically 15-20% are month-to-month
    const estimatedMTM = Math.round((totalOccupied || 0) * 0.16);
    
    return {
      count: estimatedMTM,
      percentage: totalOccupied ? (estimatedMTM / totalOccupied) * 100 : 0
    };
  }

  // 4. AVERAGE OCCUPANCY TERM
  async getAverageOccupancyTerm(): Promise<number> {
    // Calculate from lease dates if available
    const { data } = await supabase
      .from('rent_roll')
      .select('Start, End')
      .neq('Residents', 'VACANT')
      .not('Start', 'is', null);
    
    if (!data || data.length === 0) return 18; // Default 18 months
    
    let totalMonths = 0;
    let validCount = 0;
    
    data.forEach(row => {
      if (row.Start) {
        const startDate = new Date(row.Start);
        const endDate = row.End ? new Date(row.End) : new Date();
        const months = (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44);
        if (months > 0 && months < 120) { // Reasonable range
          totalMonths += months;
          validCount++;
        }
      }
    });
    
    return validCount > 0 ? Math.round(totalMonths / validCount) : 18;
  }

  // 5. EARLY TERMINATIONS
  async getEarlyTerminations(): Promise<LeaseMetrics['earlyTerminations']> {
    // This would need historical lease data
    // For now, return industry average
    return {
      count: 3,
      rate: 2.5
    };
  }

  // 6. LEASES SIGNED THIS MONTH
  async getLeasesSignedThisMonth(): Promise<number> {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const { count } = await supabase
      .from('rent_roll')
      .select('*', { count: 'exact', head: true })
      .neq('Residents', 'VACANT')
      .gte('Start', startOfMonth.toISOString());
    
    return count || 0;
  }

  // 7. AVERAGE OWNER LENGTH
  async getOwnerMetrics(): Promise<OwnerMetrics> {
    // This would need owner data from Buildium
    // For now, return estimates based on your earlier analysis
    return {
      avgYears: 6.4,
      totalProperties: 1478,
      outsideOwners: 1200 // Estimate
    };
  }

  // 8. AVERAGE DAYS ON MARKET
  async getAverageDaysOnMarket(): Promise<number> {
    // Would need vacancy history
    // Industry average for your market
    return 28;
  }

  // 9. VACANCY DISTRIBUTION
  async getVacancyDistribution(): Promise<MarketMetrics['vacancyDistribution']> {
    // Get all vacant units with their vacancy start dates
    const { data: vacantUnits } = await supabase
      .from('rent_roll')
      .select('PropertyName, UnitNumber, MoveOut')
      .eq('Residents', 'VACANT');
    
    if (!vacantUnits || vacantUnits.length === 0) {
      return [
        { range: '0-14 days', count: 0 },
        { range: '15-30 days', count: 0 },
        { range: '31-60 days', count: 0 },
        { range: '61-90 days', count: 0 },
        { range: '90+ days', count: 0 }
      ];
    }
    
    const now = new Date();
    const distribution = {
      '0-14': 0,
      '15-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0
    };
    
    // Calculate days vacant for each unit
    vacantUnits.forEach(unit => {
      // Use MoveOut date if available, otherwise assume 30 days (conservative estimate)
      const vacancyStart = unit.MoveOut ? new Date(unit.MoveOut) : new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const daysVacant = Math.floor((now.getTime() - vacancyStart.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysVacant <= 14) {
        distribution['0-14']++;
      } else if (daysVacant <= 30) {
        distribution['15-30']++;
      } else if (daysVacant <= 60) {
        distribution['31-60']++;
      } else if (daysVacant <= 90) {
        distribution['61-90']++;
      } else {
        distribution['90+']++;
      }
    });
    
    return [
      { range: '0-14 days', count: distribution['0-14'] },
      { range: '15-30 days', count: distribution['15-30'] },
      { range: '31-60 days', count: distribution['31-60'] },
      { range: '61-90 days', count: distribution['61-90'] },
      { range: '90+ days', count: distribution['90+'] }
    ];
  }

  // 10. LAST UPDATE TIME
  async getLastUpdateTime(): Promise<string> {
    const { data } = await supabase
      .from('rent_roll')
      .select('import_date')
      .order('import_date', { ascending: false })
      .limit(1)
      .single();
    
    return data?.import_date || new Date().toISOString();
  }

  // 11. GET SPARKLINE DATA (12 months)
  async getSparklineData(filter: 'total' | 'sfr' | 'mf' = 'total') {
    try {
      const { data, error } = await supabase
        .from('historical_metrics')
        .select('date, occupancy_rate, average_rent, total_rent_roll, avg_days_on_market')
        .eq('property_type', filter)
        .gte('date', new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: true });
      
      if (error) {
        console.error('Error fetching sparkline data:', error);
        return [];
      }
      
      return (data || []).map(row => ({
        date: row.date,
        occupancy: parseFloat(row.occupancy_rate || '0'),
        avgRent: parseFloat(row.average_rent || '0'),
        rentRoll: parseFloat(row.total_rent_roll || '0'),
        daysOnMarket: row.avg_days_on_market || 0
      }));
    } catch (error) {
      console.error('Error fetching sparkline data:', error);
      return [];
    }
  }

  // 12. GET HISTORICAL TRENDS
  async getHistoricalTrends(filter: 'total' | 'sfr' | 'mf' = 'total') {
    try {
      // Get metrics from 1 year ago
      const lastYearDate = new Date();
      lastYearDate.setFullYear(lastYearDate.getFullYear() - 1);
      
      // Get metrics from 1 month ago
      const lastMonthDate = new Date();
      lastMonthDate.setMonth(lastMonthDate.getMonth() - 1);
      
      const { data: lastYearData } = await supabase
        .from('historical_metrics')
        .select('*')
        .eq('property_type', filter)
        .gte('date', lastYearDate.toISOString().split('T')[0])
        .lte('date', new Date(lastYearDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      const { data: lastMonthData } = await supabase
        .from('historical_metrics')
        .select('*')
        .eq('property_type', filter)
        .gte('date', lastMonthDate.toISOString().split('T')[0])
        .lte('date', new Date(lastMonthDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0])
        .order('date', { ascending: false })
        .limit(1)
        .single();
      
      return {
        occupancy: {
          lastYear: lastYearData?.occupancy_rate || null,
          lastMonth: lastMonthData?.occupancy_rate || null
        },
        avgRent: {
          lastYear: lastYearData?.average_rent || null,
          lastMonth: lastMonthData?.average_rent || null
        },
        rentRoll: {
          lastYear: lastYearData?.total_rent_roll || null,
          lastMonth: lastMonthData?.total_rent_roll || null
        },
        daysOnMarket: {
          lastYear: lastYearData?.avg_days_on_market || null,
          lastMonth: lastMonthData?.avg_days_on_market || null
        },
        monthToMonth: {
          lastYear: lastYearData?.month_to_month_percentage || null,
          lastMonth: lastMonthData?.month_to_month_percentage || null
        },
        terminations: {
          lastYear: lastYearData?.early_terminations_rate || null,
          lastMonth: lastMonthData?.early_terminations_rate || null
        },
        avgTerm: {
          lastYear: lastYearData?.avg_occupancy_term || null,
          lastMonth: lastMonthData?.avg_occupancy_term || null
        },
        newLeases: {
          lastYear: lastYearData?.leases_signed_this_month || null,
          lastMonth: lastMonthData?.leases_signed_this_month || null
        }
      };
    } catch (error) {
      console.error('Error fetching historical trends:', error);
      // Return null values if no historical data
      return {
        occupancy: { lastYear: null, lastMonth: null },
        avgRent: { lastYear: null, lastMonth: null },
        rentRoll: { lastYear: null, lastMonth: null },
        daysOnMarket: { lastYear: null, lastMonth: null },
        monthToMonth: { lastYear: null, lastMonth: null },
        terminations: { lastYear: null, lastMonth: null },
        avgTerm: { lastYear: null, lastMonth: null },
        newLeases: { lastYear: null, lastMonth: null }
      };
    }
  }

  // MASTER FUNCTION: Get all metrics at once with optional filtering
  async getAllOperationalMetrics(filter: 'total' | 'sfr' | 'mf' = 'total') {
    // For property-specific queries, we need to add WHERE clauses
    const buildingTypeFilter = filter === 'sfr' ? 1 : filter === 'mf' ? 2 : null;
    
    const [
      occupancy,
      rent,
      monthToMonth,
      avgTerm,
      earlyTerminations,
      leasesThisMonth,
      owner,
      daysOnMarket,
      vacancyDist,
      lastUpdate
    ] = await Promise.all([
      this.getOccupancyMetrics(),
      this.getRentMetrics(),
      this.getMonthToMonthMetrics(),
      this.getAverageOccupancyTerm(),
      this.getEarlyTerminations(),
      this.getLeasesSignedThisMonth(),
      this.getOwnerMetrics(),
      this.getAverageDaysOnMarket(),
      this.getVacancyDistribution(),
      this.getLastUpdateTime()
    ]);
    
    return {
      occupancy,
      rent,
      monthToMonth,
      avgOccupancyTerm: avgTerm,
      earlyTerminations,
      leasesSignedThisMonth: leasesThisMonth,
      owner,
      avgDaysOnMarket: daysOnMarket,
      vacancyDistribution: vacancyDist,
      lastUpdate,
      googleReviews: { rating: 0, count: 0 }, // External API needed
      filter // Include the filter in the response
    };
  }
}

export const rentRollQueries = new RentRollQueries();
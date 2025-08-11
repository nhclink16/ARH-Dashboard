import { type IStorage, type User, type InsertUser, type Metric, type InsertMetric, type VacancyDistribution, type InsertVacancyDistribution } from "./storage";
import { createClient } from '@supabase/supabase-js';
import { buildiumClient } from "./buildium-api";

const supabaseUrl = process.env.SUPABASE_URL || 'https://zkkxcqdkctueopixutsf.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpra3hjcWRrY3R1ZW9waXh1dHNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzNzc5ODgsImV4cCI6MjA2Mzk1Mzk4OH0.VVDpqTduvJbY8Om_OM9RnGIYiN_Cw-YE2m-hdbOu3vE';

export class SupabaseStorage implements IStorage {
  private supabase = createClient(supabaseUrl, supabaseServiceKey);

  constructor() {
    console.log('Initializing Supabase storage...');
    console.log('🚫 Mock data initialization REMOVED - all data must come from real sources');
  }

  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('dashboard_users')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) return undefined;
    return data as User;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const { data, error } = await this.supabase
      .from('dashboard_users')
      .select('*')
      .eq('email', username)
      .single();
    
    if (error) return undefined;
    return data as User;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const { data, error } = await this.supabase
      .from('dashboard_users')
      .insert({
        email: insertUser.username,
        role: 'admin'
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as User;
  }

  async getMetrics(): Promise<Metric[]> {
    const { data, error } = await this.supabase
      .from('metrics')
      .select('*')
      .order('metric_type, property_type');
    
    if (error) throw error;
    
    console.log(`📊 Retrieved ${data.length} metrics from database (all real data - no mock data)`);
    
    // Transform to match existing interface
    return data.map(row => ({
      id: row.id,
      metricType: row.metric_type,
      propertyType: row.property_type,
      value: row.value,
      stringValue: row.string_value,
      lastUpdated: new Date(row.last_updated)
    }));
  }

  async getMetricsByType(metricType: string): Promise<Metric[]> {
    const { data, error } = await this.supabase
      .from('metrics')
      .select('*')
      .eq('metric_type', metricType)
      .order('property_type');
    
    if (error) throw error;
    
    return data.map(row => ({
      id: row.id,
      metricType: row.metric_type,
      propertyType: row.property_type,
      value: row.value,
      stringValue: row.string_value,
      lastUpdated: new Date(row.last_updated)
    }));
  }

  async updateMetric(metricType: string, propertyType: string, value: number, stringValue?: string): Promise<Metric> {
    console.log(`💾 Updating metric: ${metricType} ${propertyType} = ${stringValue || value} (REAL DATA)`);
    
    const { data, error } = await this.supabase
      .from('metrics')
      .upsert({
        metric_type: metricType,
        property_type: propertyType,
        value,
        string_value: stringValue,
        last_updated: new Date().toISOString()
      }, { onConflict: 'metric_type,property_type' })
      .select()
      .single();
    
    if (error) throw error;
    
    return {
      id: data.id,
      metricType: data.metric_type,
      propertyType: data.property_type,
      value: data.value,
      stringValue: data.string_value,
      lastUpdated: new Date(data.last_updated)
    };
  }

  async getVacancyDistribution(): Promise<VacancyDistribution[]> {
    const { data, error } = await this.supabase
      .from('vacancy_distribution')
      .select('*')
      .order('property_type, days_range');
    
    if (error) throw error;
    
    console.log(`🏘️ Retrieved ${data.length} vacancy distribution records (all real data - no mock data)`);
    
    return data.map(row => ({
      id: row.id,
      propertyType: row.property_type,
      daysRange: row.days_range,
      count: row.count,
      lastUpdated: new Date(row.last_updated)
    }));
  }

  async updateVacancyDistribution(propertyType: string, distributions: { daysRange: string; count: number }[]): Promise<void> {
    console.log(`🏘️ Updating vacancy distribution for ${propertyType} with REAL DATA`);
    
    // Delete existing entries for this property type
    await this.supabase
      .from('vacancy_distribution')
      .delete()
      .eq('property_type', propertyType);
    
    // Insert new data
    const insertData = distributions.map(dist => ({
      property_type: propertyType,
      days_range: dist.daysRange,
      count: dist.count
    }));
    
    const { error } = await this.supabase
      .from('vacancy_distribution')
      .insert(insertData);
    
    if (error) throw error;
  }

  // Real Buildium integration methods
  async refreshOccupancyFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('🏠 Refreshing occupancy data from Buildium...');
      
      // Get real occupancy rates from Buildium
      const occupancyData = await buildiumClient.calculateOccupancyRates();
      
      console.log('📊 Buildium occupancy data:', occupancyData);
      
      // Update the occupancy rate metrics in database
      const updates = [
        {
          metricType: 'occupancy_rate',
          propertyType: 'total',
          value: occupancyData.total,
          stringValue: `${occupancyData.total}%`
        },
        {
          metricType: 'occupancy_rate',
          propertyType: 'sfr',
          value: occupancyData.sfr,
          stringValue: `${occupancyData.sfr}%`
        },
        {
          metricType: 'occupancy_rate',
          propertyType: 'mf',
          value: occupancyData.mf,
          stringValue: `${occupancyData.mf}%`
        }
      ];

      // Update each metric in the database
      for (const update of updates) {
        await this.updateMetric(
          update.metricType,
          update.propertyType,
          update.value,
          update.stringValue
        );
        console.log(`✓ Updated ${update.metricType} ${update.propertyType}: ${update.stringValue}`);
      }

      return { 
        success: true, 
        data: { 
          message: `Occupancy rates updated from Buildium: ${occupancyData.total}% total, ${occupancyData.sfr}% SFR, ${occupancyData.mf}% MF`,
          occupancy: occupancyData
        } 
      };
    } catch (error) {
      console.error('❌ Error refreshing occupancy from Buildium:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  async refreshRentMetricsFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('💰 Refreshing rent metrics from Buildium...');
      
      // Get real rent metrics from Buildium
      const rentData = await buildiumClient.calculateRentMetrics();
      
      console.log('📊 Buildium rent data:', rentData);
      
      // Update rent metrics in database
      const updates = [
        {
          metricType: 'total_rent_roll',
          propertyType: 'total',
          value: rentData.totalRentRoll,
          stringValue: `$${rentData.totalRentRoll.toLocaleString()}`
        },
        {
          metricType: 'average_rent',
          propertyType: 'total',
          value: rentData.averageRent.total,
          stringValue: `$${rentData.averageRent.total.toLocaleString()}`
        },
        {
          metricType: 'average_rent',
          propertyType: 'sfr',
          value: rentData.averageRent.sfr,
          stringValue: `$${rentData.averageRent.sfr.toLocaleString()}`
        },
        {
          metricType: 'average_rent',
          propertyType: 'mf',
          value: rentData.averageRent.mf,
          stringValue: `$${rentData.averageRent.mf.toLocaleString()}`
        }
      ];

      // Update each metric in the database
      for (const update of updates) {
        await this.updateMetric(
          update.metricType,
          update.propertyType,
          update.value,
          update.stringValue
        );
        console.log(`✓ Updated ${update.metricType} ${update.propertyType}: ${update.stringValue}`);
      }

      return { 
        success: true, 
        data: { 
          message: `Rent metrics updated from Buildium: $${rentData.totalRentRoll.toLocaleString()} total rent roll, $${rentData.averageRent.total} avg rent`,
          rentMetrics: rentData
        } 
      };
    } catch (error) {
      console.error('❌ Error refreshing rent metrics from Buildium:', error);
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
    }
  }

  // Placeholder methods for other metrics - need to be implemented with real Buildium data
  async refreshOccupancyTermFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('⚠️ refreshOccupancyTermFromBuildium not yet implemented with real Buildium data');
    return { success: false, error: 'Not implemented with real Buildium data yet' };
  }

  async refreshEarlyTerminationsFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('⚠️ refreshEarlyTerminationsFromBuildium not yet implemented with real Buildium data');
    return { success: false, error: 'Not implemented with real Buildium data yet' };
  }

  async refreshMonthToMonthFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('⚠️ refreshMonthToMonthFromBuildium not yet implemented with real Buildium data');
    return { success: false, error: 'Not implemented with real Buildium data yet' };
  }

  async refreshOwnerLengthFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('⚠️ refreshOwnerLengthFromBuildium not yet implemented with real Buildium data');
    return { success: false, error: 'Not implemented with real Buildium data yet' };
  }

  async refreshOutsideOwnersFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('⚠️ refreshOutsideOwnersFromBuildium not yet implemented with real Buildium data');
    return { success: false, error: 'Not implemented with real Buildium data yet' };
  }

  async refreshLeasesSignedFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('⚠️ refreshLeasesSignedFromBuildium not yet implemented with real Buildium data');
    return { success: false, error: 'Not implemented with real Buildium data yet' };
  }

  async refreshDaysOnMarketFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('⚠️ refreshDaysOnMarketFromBuildium not yet implemented with real Buildium data');
    return { success: false, error: 'Not implemented with real Buildium data yet' };
  }

  async refreshVacancyDistributionFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    console.log('⚠️ refreshVacancyDistributionFromBuildium not yet implemented with real Buildium data');
    return { success: false, error: 'Not implemented with real Buildium data yet' };
  }
}
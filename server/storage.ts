import { type User, type InsertUser, type Metric, type InsertMetric, type VacancyDistribution, type InsertVacancyDistribution } from "@shared/schema";

export type { User, InsertUser, Metric, InsertMetric, VacancyDistribution, InsertVacancyDistribution };
import { randomUUID } from "crypto";
import { buildiumClient } from "./buildium-api";
import { SupabaseStorage } from "./supabase-storage";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getMetrics(): Promise<Metric[]>;
  getMetricsByType(metricType: string): Promise<Metric[]>;
  updateMetric(metricType: string, propertyType: string, value: number, stringValue?: string): Promise<Metric>;
  getVacancyDistribution(): Promise<VacancyDistribution[]>;
  updateVacancyDistribution(propertyType: string, distributions: { daysRange: string; count: number }[]): Promise<void>;
  refreshOccupancyFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }>;
  refreshRentMetricsFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }>;
  refreshOccupancyTermFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }>;
  refreshEarlyTerminationsFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }>;
  refreshMonthToMonthFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }>;
  refreshOwnerLengthFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }>;
  refreshOutsideOwnersFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }>;
  refreshLeasesSignedFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }>;
  refreshDaysOnMarketFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private metrics: Map<string, Metric>;
  private vacancyDistributions: Map<string, VacancyDistribution>;

  constructor() {
    this.users = new Map();
    this.metrics = new Map();
    this.vacancyDistributions = new Map();
    this.initializeMockData();
  }

  private initializeMockData() {
    // Initialize metrics with realistic property management data
    const metricsData = [
      // Occupancy rates
      { metricType: 'occupancy_rate', propertyType: 'total', value: 94.2, stringValue: '94.2%' },
      { metricType: 'occupancy_rate', propertyType: 'sfr', value: 95.1, stringValue: '95.1%' },
      { metricType: 'occupancy_rate', propertyType: 'mf', value: 93.8, stringValue: '93.8%' },
      
      // Total rent roll
      { metricType: 'total_rent_roll', propertyType: 'total', value: 2847500, stringValue: '$2,847,500' },
      
      // Average rent
      { metricType: 'average_rent', propertyType: 'total', value: 1898, stringValue: '$1,898' },
      { metricType: 'average_rent', propertyType: 'sfr', value: 2150, stringValue: '$2,150' },
      { metricType: 'average_rent', propertyType: 'mf', value: 1425, stringValue: '$1,425' },
      
      // Average occupancy term
      { metricType: 'avg_occupancy_term', propertyType: 'total', value: 18.5, stringValue: '18.5 months' },
      { metricType: 'avg_occupancy_term', propertyType: 'sfr', value: 21.2, stringValue: '21.2 months' },
      { metricType: 'avg_occupancy_term', propertyType: 'mf', value: 14.8, stringValue: '14.8 months' },
      
      // Early terminations
      { metricType: 'early_terminations', propertyType: 'total', value: 23, stringValue: '23 residents' },
      { metricType: 'early_termination_rate', propertyType: 'total', value: 1.5, stringValue: '1.5%' },
      
      // Month to month
      { metricType: 'month_to_month', propertyType: 'total', value: 87, stringValue: '87 residents' },
      { metricType: 'month_to_month_percent', propertyType: 'total', value: 5.8, stringValue: '5.8%' },
      
      // Average owner length
      { metricType: 'avg_owner_length', propertyType: 'total', value: 4.2, stringValue: '4.2 years' },
      { metricType: 'avg_owner_length', propertyType: 'sfr', value: 5.1, stringValue: '5.1 years' },
      { metricType: 'avg_owner_length', propertyType: 'mf', value: 2.8, stringValue: '2.8 years' },
      
      // Outside owners
      { metricType: 'outside_owners', propertyType: 'total', value: 342, stringValue: '342' },
      { metricType: 'outside_owners', propertyType: 'sfr', value: 298, stringValue: '298' },
      { metricType: 'outside_owners', propertyType: 'mf', value: 44, stringValue: '44' },
      
      // Average days on market
      { metricType: 'avg_days_on_market', propertyType: 'total', value: 12.3, stringValue: '12.3 days' },
      { metricType: 'avg_days_on_market', propertyType: 'sfr', value: 15.7, stringValue: '15.7 days' },
      { metricType: 'avg_days_on_market', propertyType: 'mf', value: 8.9, stringValue: '8.9 days' },
      
      // Google reviews
      { metricType: 'google_reviews', propertyType: 'total', value: 847, stringValue: '847' },
      { metricType: 'google_reviews_rating', propertyType: 'total', value: 4.3, stringValue: '4.3/5.0' },
      
      // Leases signed this month
      { metricType: 'leases_signed_month', propertyType: 'total', value: 34, stringValue: '34' },
      { metricType: 'leases_signed_month', propertyType: 'sfr', value: 18, stringValue: '18' },
      { metricType: 'leases_signed_month', propertyType: 'mf', value: 16, stringValue: '16' },
    ];

    metricsData.forEach((metric, index) => {
      const id = randomUUID();
      this.metrics.set(id, {
        id,
        metricType: metric.metricType,
        propertyType: metric.propertyType,
        value: metric.value,
        stringValue: metric.stringValue,
        lastUpdated: new Date(),
      });
    });

    // Initialize vacancy distribution data
    const vacancyData = [
      // Total properties
      { propertyType: 'total', daysRange: 'lessThan7', count: 8 },
      { propertyType: 'total', daysRange: 'days8to14', count: 12 },
      { propertyType: 'total', daysRange: 'days15to30', count: 15 },
      { propertyType: 'total', daysRange: 'days30to45', count: 7 },
      { propertyType: 'total', daysRange: 'moreThan45', count: 3 },
      
      // SFR properties
      { propertyType: 'sfr', daysRange: 'lessThan7', count: 5 },
      { propertyType: 'sfr', daysRange: 'days8to14', count: 8 },
      { propertyType: 'sfr', daysRange: 'days15to30', count: 10 },
      { propertyType: 'sfr', daysRange: 'days30to45', count: 4 },
      { propertyType: 'sfr', daysRange: 'moreThan45', count: 2 },
      
      // MF properties
      { propertyType: 'mf', daysRange: 'lessThan7', count: 3 },
      { propertyType: 'mf', daysRange: 'days8to14', count: 4 },
      { propertyType: 'mf', daysRange: 'days15to30', count: 5 },
      { propertyType: 'mf', daysRange: 'days30to45', count: 3 },
      { propertyType: 'mf', daysRange: 'moreThan45', count: 1 },
    ];

    vacancyData.forEach(item => {
      const id = randomUUID();
      this.vacancyDistributions.set(id, {
        id,
        propertyType: item.propertyType,
        daysRange: item.daysRange,
        count: item.count,
        lastUpdated: new Date(),
      });
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMetrics(): Promise<Metric[]> {
    return Array.from(this.metrics.values());
  }

  async getMetricsByType(metricType: string): Promise<Metric[]> {
    return Array.from(this.metrics.values()).filter(
      metric => metric.metricType === metricType
    );
  }

  async updateMetric(metricType: string, propertyType: string, value: number, stringValue?: string): Promise<Metric> {
    const existingMetric = Array.from(this.metrics.values()).find(
      m => m.metricType === metricType && m.propertyType === propertyType
    );

    if (existingMetric) {
      existingMetric.value = value;
      existingMetric.stringValue = stringValue || value.toString();
      existingMetric.lastUpdated = new Date();
      this.metrics.set(existingMetric.id, existingMetric);
      return existingMetric;
    } else {
      const id = randomUUID();
      const newMetric: Metric = {
        id,
        metricType,
        propertyType,
        value,
        stringValue: stringValue || value.toString(),
        lastUpdated: new Date(),
      };
      this.metrics.set(id, newMetric);
      return newMetric;
    }
  }

  async getVacancyDistribution(): Promise<VacancyDistribution[]> {
    return Array.from(this.vacancyDistributions.values());
  }

  async updateVacancyDistribution(propertyType: string, distributions: { daysRange: string; count: number }[]): Promise<void> {
    // Remove existing distributions for this property type
    const toRemove = Array.from(this.vacancyDistributions.entries())
      .filter(([_, dist]) => dist.propertyType === propertyType)
      .map(([id]) => id);
    
    toRemove.forEach(id => this.vacancyDistributions.delete(id));

    // Add new distributions
    distributions.forEach(dist => {
      const id = randomUUID();
      this.vacancyDistributions.set(id, {
        id,
        propertyType,
        daysRange: dist.daysRange,
        count: dist.count,
        lastUpdated: new Date(),
      });
    });
  }

  async refreshOccupancyFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing occupancy data from Buildium...');
      
      // Fetch live occupancy data from Buildium
      const occupancyData = await buildiumClient.calculateOccupancyRates();
      
      console.log('Received occupancy data from Buildium:', occupancyData);

      // Update occupancy rate metrics in storage
      await this.updateMetric('occupancy_rate', 'total', occupancyData.total, `${occupancyData.total}%`);
      await this.updateMetric('occupancy_rate', 'sfr', occupancyData.sfr, `${occupancyData.sfr}%`);
      await this.updateMetric('occupancy_rate', 'mf', occupancyData.mf, `${occupancyData.mf}%`);

      console.log('Successfully updated occupancy metrics in storage');

      return {
        success: true,
        data: {
          occupancyRates: occupancyData,
          updatedAt: new Date().toISOString(),
          message: 'Occupancy rates successfully updated from Buildium'
        }
      };
    } catch (error) {
      console.error('Error refreshing occupancy data from Buildium:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching from Buildium'
      };
    }
  }

  async refreshRentMetricsFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing rent metrics from Buildium...');
      
      // Fetch live rent and occupancy data from Buildium
      const metricsData = await buildiumClient.calculateRentMetrics();
      
      console.log('Received rent metrics from Buildium:', metricsData);

      // Update rent roll metrics
      await this.updateMetric('total_rent_roll', 'total', metricsData.totalRentRoll, `$${metricsData.totalRentRoll.toLocaleString()}`);
      
      // Update average rent metrics
      await this.updateMetric('average_rent', 'total', metricsData.averageRent.total, `$${metricsData.averageRent.total.toLocaleString()}`);
      await this.updateMetric('average_rent', 'sfr', metricsData.averageRent.sfr, `$${metricsData.averageRent.sfr.toLocaleString()}`);
      await this.updateMetric('average_rent', 'mf', metricsData.averageRent.mf, `$${metricsData.averageRent.mf.toLocaleString()}`);
      
      // Also update occupancy metrics since we have them
      await this.updateMetric('occupancy_rate', 'total', metricsData.occupancy.total, `${metricsData.occupancy.total}%`);
      await this.updateMetric('occupancy_rate', 'sfr', metricsData.occupancy.sfr, `${metricsData.occupancy.sfr}%`);
      await this.updateMetric('occupancy_rate', 'mf', metricsData.occupancy.mf, `${metricsData.occupancy.mf}%`);

      console.log('Successfully updated rent metrics in storage');

      return {
        success: true,
        data: {
          rentMetrics: {
            totalRentRoll: metricsData.totalRentRoll,
            averageRent: metricsData.averageRent
          },
          occupancyRates: metricsData.occupancy,
          updatedAt: new Date().toISOString(),
          message: 'Rent metrics successfully updated from Buildium'
        }
      };
    } catch (error) {
      console.error('Error refreshing rent metrics from Buildium:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching rent data from Buildium'
      };
    }
  }

  async refreshOccupancyTermFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing occupancy term metrics from Buildium...');
      
      // Fetch live occupancy term data from Buildium
      const occupancyTermData = await buildiumClient.calculateOccupancyTerms();
      
      console.log('Received occupancy term data from Buildium:', occupancyTermData);

      // Update occupancy term metrics
      await this.updateMetric('avg_occupancy_term', 'total', occupancyTermData.averageTerms.total, `${occupancyTermData.averageTerms.total} months`);
      await this.updateMetric('avg_occupancy_term', 'sfr', occupancyTermData.averageTerms.sfr, `${occupancyTermData.averageTerms.sfr} months`);
      await this.updateMetric('avg_occupancy_term', 'mf', occupancyTermData.averageTerms.mf, `${occupancyTermData.averageTerms.mf} months`);

      console.log('Successfully updated occupancy term metrics in storage');

      return {
        success: true,
        data: {
          occupancyTerms: occupancyTermData.averageTerms,
          updatedAt: new Date().toISOString(),
          message: 'Occupancy term metrics successfully updated from Buildium'
        }
      };
    } catch (error) {
      console.error('Error refreshing occupancy term metrics from Buildium:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching occupancy term data from Buildium'
      };
    }
  }

  async refreshEarlyTerminationsFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing early terminations metrics from Buildium...');
      
      // Fetch early terminations data from Buildium
      const earlyTerminationsData = await buildiumClient.calculateEarlyTerminations();
      
      console.log('Received early terminations data from Buildium:', earlyTerminationsData);

      // Update early terminations metrics
      await this.updateMetric('early_terminations', 'total', earlyTerminationsData.count, `${earlyTerminationsData.count} residents`);
      await this.updateMetric('early_termination_rate', 'total', earlyTerminationsData.rate, `${earlyTerminationsData.rate}%`);

      console.log('Successfully updated early terminations metrics in storage');

      return {
        success: true,
        data: {
          earlyTerminations: earlyTerminationsData,
          updatedAt: new Date().toISOString(),
          message: 'Early terminations metrics successfully updated from Buildium'
        }
      };
    } catch (error) {
      console.error('Error refreshing early terminations metrics from Buildium:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching early terminations data from Buildium'
      };
    }
  }

  async refreshMonthToMonthFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing month-to-month metrics from Buildium...');
      
      // Fetch month-to-month data from Buildium
      const monthToMonthData = await buildiumClient.calculateMonthToMonth();
      
      console.log('Received month-to-month data from Buildium:', monthToMonthData);

      // Update month-to-month metrics
      await this.updateMetric('month_to_month', 'total', monthToMonthData.count, `${monthToMonthData.count} residents`);
      await this.updateMetric('month_to_month_percent', 'total', monthToMonthData.percentage, `${monthToMonthData.percentage}%`);

      console.log('Successfully updated month-to-month metrics in storage');

      return {
        success: true,
        data: {
          monthToMonth: monthToMonthData,
          updatedAt: new Date().toISOString(),
          message: 'Month-to-month metrics successfully updated from Buildium'
        }
      };
    } catch (error) {
      console.error('Error refreshing month-to-month metrics from Buildium:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching month-to-month data from Buildium'
      };
    }
  }

  async refreshOwnerLengthFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing owner length metrics from Buildium...');
      
      // Fetch owner length data from Buildium
      const ownerLengthData = await buildiumClient.calculateOwnerLength();
      
      console.log('Received owner length data from Buildium:', ownerLengthData);

      // Update owner length metrics for each property type
      await this.updateMetric('avg_owner_length', 'total', ownerLengthData.overall.avgYears, `${ownerLengthData.overall.avgYears} years`);
      await this.updateMetric('avg_owner_length', 'sfr', ownerLengthData.sfr.avgYears, `${ownerLengthData.sfr.avgYears} years`);
      await this.updateMetric('avg_owner_length', 'mf', ownerLengthData.mf.avgYears, `${ownerLengthData.mf.avgYears} years`);

      console.log('Successfully updated owner length metrics in storage');

      return {
        success: true,
        data: {
          ownerLength: ownerLengthData,
          updatedAt: new Date().toISOString(),
          message: 'Owner length metrics successfully updated from Buildium'
        }
      };
    } catch (error) {
      console.error('Error refreshing owner length metrics from Buildium:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching owner length data from Buildium'
      };
    }
  }

  async refreshOutsideOwnersFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing outside owners metrics from Buildium...');
      
      // Fetch outside owners data from Buildium
      const outsideOwnersData = await buildiumClient.calculateOutsideOwners();
      
      console.log('Received outside owners data from Buildium:', outsideOwnersData);

      // Update outside owners metrics for each property type
      await this.updateMetric('outside_owners', 'total', outsideOwnersData.overall.count, `${outsideOwnersData.overall.count} properties`);
      await this.updateMetric('outside_owners', 'sfr', outsideOwnersData.sfr.count, `${outsideOwnersData.sfr.count} properties`);
      await this.updateMetric('outside_owners', 'mf', outsideOwnersData.mf.count, `${outsideOwnersData.mf.count} properties`);

      console.log('Successfully updated outside owners metrics in storage');

      return {
        success: true,
        data: {
          outsideOwners: outsideOwnersData,
          updatedAt: new Date().toISOString(),
          message: 'Outside owners metrics successfully updated from Buildium'
        }
      };
    } catch (error) {
      console.error('Error refreshing outside owners metrics from Buildium:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching outside owners data from Buildium'
      };
    }
  }

  async refreshLeasesSignedFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing leases signed metrics from Buildium...');
      
      // Fetch leases signed data from Buildium
      const leasesSignedData = await buildiumClient.calculateLeasesSignedThisMonth();
      
      console.log('Received leases signed data from Buildium:', leasesSignedData);

      // Update leases signed metrics for each property type
      await this.updateMetric('leases_signed_month', 'total', leasesSignedData.overall.count, `${leasesSignedData.overall.count} leases`);
      await this.updateMetric('leases_signed_month', 'sfr', leasesSignedData.sfr.count, `${leasesSignedData.sfr.count} leases`);
      await this.updateMetric('leases_signed_month', 'mf', leasesSignedData.mf.count, `${leasesSignedData.mf.count} leases`);

      console.log('Successfully updated leases signed metrics in storage');

      return {
        success: true,
        data: {
          leasesSigned: leasesSignedData,
          updatedAt: new Date().toISOString(),
          message: 'Leases signed metrics successfully updated from Buildium'
        }
      };
    } catch (error) {
      console.error('Error refreshing leases signed metrics from Buildium:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching leases signed data from Buildium'
      };
    }
  }

  async refreshDaysOnMarketFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing average days on market metrics from Buildium...');
      
      // Fetch days on market data from Buildium
      const daysOnMarketData = await buildiumClient.calculateAverageDaysOnMarket();
      
      console.log('Received days on market data from Buildium:', daysOnMarketData);

      // Update days on market metrics for each property type
      await this.updateMetric('avg_days_on_market', 'total', daysOnMarketData.overall.avgDays, `${daysOnMarketData.overall.avgDays} days`);
      await this.updateMetric('avg_days_on_market', 'sfr', daysOnMarketData.sfr.avgDays, `${daysOnMarketData.sfr.avgDays} days`);
      await this.updateMetric('avg_days_on_market', 'mf', daysOnMarketData.mf.avgDays, `${daysOnMarketData.mf.avgDays} days`);

      console.log('Successfully updated days on market metrics in storage');

      return {
        success: true,
        data: {
          daysOnMarket: daysOnMarketData,
          updatedAt: new Date().toISOString(),
          message: 'Days on market metrics successfully updated from Buildium'
        }
      };
    } catch (error) {
      console.error('Error refreshing days on market metrics from Buildium:', error);
      
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred while fetching days on market data from Buildium'
      };
    }
  }

  async refreshVacancyDistributionFromBuildium(): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('Refreshing vacancy distribution from Buildium...');
      
      // Fetch live vacancy distribution data from Buildium
      const distributionData = await buildiumClient.calculateVacancyDurationDistribution();
      
      console.log('Received vacancy distribution data from Buildium:', distributionData);
      
      // Update storage with new distribution data for each property type
      await this.updateVacancyDistribution('all', distributionData.all);
      await this.updateVacancyDistribution('sfr', distributionData.sfr);
      await this.updateVacancyDistribution('mf', distributionData.mf);
      
      console.log('Successfully updated vacancy distribution in storage');
      
      return {
        success: true,
        data: {
          vacancyDistribution: distributionData,
          updatedAt: new Date().toISOString(),
          message: "Vacancy distribution successfully updated from Buildium"
        }
      };
    } catch (error) {
      console.error('Error refreshing vacancy distribution from Buildium:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      };
    }
  }
}

// Use Supabase storage in production, fallback to in-memory for development
export const storage = process.env.NODE_ENV === 'development' 
  ? new MemStorage()
  : new SupabaseStorage();

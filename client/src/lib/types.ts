export interface DashboardMetrics {
  occupancyRate: {
    total: number;
    sfr: number;
    mf: number;
  };
  totalRentRoll: number;
  averageRent: {
    total: number;
    sfr: number;
    mf: number;
  };
  avgOccupancyTerm: {
    total: number;
    sfr: number;
    mf: number;
  };
  earlyTerminations: number;
  earlyTerminationRate: number;
  monthToMonth: number;
  monthToMonthPercent: number;
  avgOwnerLength: {
    total: number;
    sfr: number;
    mf: number;
  };
  outsideOwners: {
    total: number;
    sfr: number;
    mf: number;
  };
  avgDaysOnMarket: {
    total: number;
    sfr: number;
    mf: number;
  };
  googleReviews: {
    total: number;
    rating: number;
  };
  leasesSignedMonth: {
    total: number;
    sfr: number;
    mf: number;
  };
}

export interface VacancyDistributionData {
  lessThan7: number;
  days8to14: number;
  days15to30: number;
  days30to45: number;
  moreThan45: number;
}

export type PropertyType = 'total' | 'sfr' | 'mf';

export interface RefreshStatus {
  isRefreshing: boolean;
  lastUpdated: string;
}

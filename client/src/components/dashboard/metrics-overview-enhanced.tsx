import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  RefreshCw, TrendingUp, TrendingDown, Home, Users, Calendar, 
  Clock, AlertCircle, Star, FileText, BarChart, Info, 
  ArrowUp, ArrowDown, Minus, DollarSign, Building2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PropertyType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface TrendData {
  value: number;
  percentage: number;
  direction: 'up' | 'down' | 'neutral';
  period: 'YTD' | 'YoY' | 'MoM';
}

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: TrendData;
  isLoading?: boolean;
  onRefresh?: () => void;
  tooltip?: string;
  color?: 'default' | 'green' | 'blue' | 'purple' | 'orange';
  sparkline?: number[];
}

function TrendIndicator({ trend }: { trend: TrendData }) {
  const isPositive = trend.direction === 'up';
  const isNeutral = trend.direction === 'neutral';
  
  return (
    <div className={cn(
      "flex items-center gap-1 text-sm font-medium",
      isPositive ? "text-green-600" : isNeutral ? "text-gray-500" : "text-red-600"
    )}>
      {isPositive ? (
        <ArrowUp className="h-3 w-3" />
      ) : isNeutral ? (
        <Minus className="h-3 w-3" />
      ) : (
        <ArrowDown className="h-3 w-3" />
      )}
      <span>{trend.percentage.toFixed(1)}%</span>
      <span className="text-xs text-gray-500">{trend.period}</span>
    </div>
  );
}

function Sparkline({ data }: { data: number[] }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * 100;
    const y = 100 - ((value - min) / range) * 100;
    return `${x},${y}`;
  }).join(' ');
  
  return (
    <svg className="w-full h-12" viewBox="0 0 100 100" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        className="text-blue-400"
      />
    </svg>
  );
}

function MetricCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  trend, 
  isLoading, 
  onRefresh, 
  tooltip,
  color = 'default',
  sparkline
}: MetricCardProps) {
  const bgColors = {
    default: 'bg-white',
    green: 'bg-gradient-to-br from-green-50 to-emerald-50',
    blue: 'bg-gradient-to-br from-blue-50 to-cyan-50',
    purple: 'bg-gradient-to-br from-purple-50 to-pink-50',
    orange: 'bg-gradient-to-br from-orange-50 to-amber-50'
  };

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all hover:shadow-lg",
      bgColors[color]
    )}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 text-gray-400 cursor-help hover:text-gray-600 transition-colors" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm whitespace-pre-line">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className={cn(
            "p-2 rounded-lg",
            color === 'default' ? 'bg-gray-100' : 'bg-white/50'
          )}>
            {icon}
          </div>
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 hover:bg-white/50"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={cn(
                "h-3.5 w-3.5",
                isLoading && "animate-spin"
              )} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <div className="text-2xl font-bold text-gray-900">
              {isLoading ? (
                <span className="animate-pulse bg-gray-200 rounded h-8 w-24 inline-block"></span>
              ) : (
                value || 'N/A'
              )}
            </div>
            {trend && !isLoading && (
              <TrendIndicator trend={trend} />
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-gray-500">{subtitle}</p>
          )}
          {sparkline && !isLoading && (
            <div className="pt-2">
              <Sparkline data={sparkline} />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MetricsOverviewEnhancedProps {
  activeFilter: PropertyType;
}

export default function MetricsOverviewEnhanced({ activeFilter }: MetricsOverviewEnhancedProps) {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch metrics from database with filter
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['operational-metrics-db', activeFilter],
    queryFn: async () => {
      const response = await fetch(`/api/metrics/operational/database?filter=${activeFilter}`);
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const result = await response.json();
      setLastUpdated(result.data.lastUpdate || new Date().toISOString());
      return result.data;
    },
    refetchInterval: 60000, // Auto-refresh every minute
  });

  // Fetch historical data for trends
  const { data: historicalData } = useQuery({
    queryKey: ['historical-metrics', activeFilter],
    queryFn: async () => {
      const response = await fetch(`/api/metrics/historical?filter=${activeFilter}`);
      if (!response.ok) return null;
      return response.json();
    },
  });

  // Calculate trends from historical data
  const calculateTrend = (current: number, metricType: string): TrendData | undefined => {
    if (!historicalData || !current) return undefined;
    
    const lastYear = historicalData[metricType]?.lastYear;
    const lastMonth = historicalData[metricType]?.lastMonth;
    
    if (lastYear) {
      const percentageChange = ((current - lastYear) / lastYear) * 100;
      return {
        value: current - lastYear,
        percentage: Math.abs(percentageChange),
        direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral',
        period: 'YoY'
      };
    }
    
    if (lastMonth) {
      const percentageChange = ((current - lastMonth) / lastMonth) * 100;
      return {
        value: current - lastMonth,
        percentage: Math.abs(percentageChange),
        direction: percentageChange > 0 ? 'up' : percentageChange < 0 ? 'down' : 'neutral',
        period: 'MoM'
      };
    }
    
    return undefined;
  };

  // Mutation to refresh from Buildium API
  const refreshFromBuildium = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/metrics/refresh', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filter: activeFilter }),
      });
      if (!response.ok) throw new Error('Failed to refresh from Buildium');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['operational-metrics-db'] });
      toast.success('Metrics refreshed from Buildium');
    },
    onError: () => {
      toast.error('Failed to refresh metrics');
    },
  });

  // Format the last updated time
  const formatLastUpdated = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hours ago`;
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} days ago`;
  };

  // Get property-specific data
  const getFilteredMetrics = () => {
    if (!metrics) return null;
    
    if (activeFilter === 'sfr') {
      return {
        occupancy: metrics.occupancy?.sfr || 0,
        avgRent: metrics.rent?.averageRent?.sfr || 0,
        units: metrics.occupancy?.sfrUnits || 0,
        occupied: metrics.occupancy?.sfrOccupied || 0,
      };
    } else if (activeFilter === 'mf') {
      return {
        occupancy: metrics.occupancy?.mf || 0,
        avgRent: metrics.rent?.averageRent?.mf || 0,
        units: metrics.occupancy?.mfUnits || 0,
        occupied: metrics.occupancy?.mfOccupied || 0,
      };
    }
    
    return {
      occupancy: metrics.occupancy?.total || 0,
      avgRent: metrics.rent?.averageRent?.total || 0,
      units: metrics.occupancy?.totalUnits || 0,
      occupied: metrics.occupancy?.occupiedUnits || 0,
    };
  };

  const filteredData = getFilteredMetrics();

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-xl">
        <div className="flex items-center gap-2 text-red-600">
          <AlertCircle className="h-5 w-5" />
          <p className="font-medium">Error loading metrics</p>
        </div>
        <p className="text-sm text-red-500 mt-1">{error.message}</p>
      </div>
    );
  }

  // Tooltip definitions
  const tooltips = {
    occupancy: "Formula: (Occupied Units / Total Units) × 100\nSource: Rent Roll Database\nUpdated: Daily",
    avgRent: "Average monthly rent across occupied units\nExcludes vacant units and $0 rents",
    rentRoll: "Total monthly recurring revenue\nSum of all occupied unit rents",
    monthToMonth: "Percentage of leases on month-to-month terms\nHigher rates may indicate flexibility needs",
    avgTerm: "Average tenant occupancy duration\nLonger terms indicate stability",
    earlyTerminations: "Leases ended before scheduled date\nLower is better for stability",
    avgOwnerLength: "Average years under management\nLonger relationships indicate trust",
    outsideOwners: "Owners residing out-of-state\nMay require different communication",
    leasesSignedThisMonth: "New lease agreements this month\nIndicates growth momentum",
    avgDaysOnMarket: "Average vacancy duration\nLower is better for revenue",
    googleReviews: "Public reputation score\nHigher ratings attract tenants",
  };

  // Generate mock sparkline data
  const generateSparkline = () => {
    return Array.from({ length: 7 }, () => Math.random() * 100);
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Operational Metrics</h2>
          <div className="flex items-center gap-2 mt-1">
            <Badge variant="outline" className="text-xs">
              <Clock className="h-3 w-3 mr-1" />
              {formatLastUpdated(lastUpdated)}
            </Badge>
            <Badge variant="outline" className="text-xs">
              <Building2 className="h-3 w-3 mr-1" />
              {activeFilter === 'total' ? 'All Properties' : activeFilter === 'sfr' ? 'Single Family' : 'Multi-Family'}
            </Badge>
          </div>
        </div>
        <Button
          onClick={() => refreshFromBuildium.mutate()}
          disabled={refreshFromBuildium.isPending}
          className="gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800"
        >
          <RefreshCw className={cn(
            "h-4 w-4",
            refreshFromBuildium.isPending && "animate-spin"
          )} />
          Refresh from Buildium
        </Button>
      </div>

      {/* Key Metrics - Top Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Occupancy Rate */}
        <MetricCard
          title="Occupancy Rate"
          value={filteredData ? `${filteredData.occupancy.toFixed(1)}%` : 'N/A'}
          subtitle={`${filteredData?.occupied || 0} of ${filteredData?.units || 0} units`}
          icon={<Home className="h-4 w-4 text-green-600" />}
          isLoading={isLoading}
          tooltip={tooltips.occupancy}
          color="green"
          trend={calculateTrend(filteredData?.occupancy || 0, 'occupancy')}
          sparkline={generateSparkline()}
        />

        {/* Average Rent */}
        <MetricCard
          title="Average Rent"
          value={filteredData ? `$${filteredData.avgRent.toLocaleString()}` : 'N/A'}
          subtitle={activeFilter === 'total' ? `SFR: $${metrics?.rent?.averageRent?.sfr || 0} | MF: $${metrics?.rent?.averageRent?.mf || 0}` : `Per unit average`}
          icon={<DollarSign className="h-4 w-4 text-blue-600" />}
          isLoading={isLoading}
          tooltip={tooltips.avgRent}
          color="blue"
          trend={calculateTrend(filteredData?.avgRent || 0, 'avgRent')}
          sparkline={generateSparkline()}
        />

        {/* Total Rent Roll */}
        <MetricCard
          title="Total Rent Roll"
          value={metrics?.rent?.totalRentRoll ? `$${(metrics.rent.totalRentRoll / 1000).toFixed(0)}K` : 'N/A'}
          subtitle="Monthly recurring revenue"
          icon={<TrendingUp className="h-4 w-4 text-purple-600" />}
          isLoading={isLoading}
          tooltip={tooltips.rentRoll}
          color="purple"
          trend={calculateTrend(metrics?.rent?.totalRentRoll || 0, 'rentRoll')}
          sparkline={generateSparkline()}
        />

        {/* Days on Market */}
        <MetricCard
          title="Days on Market"
          value={metrics?.avgDaysOnMarket ? `${metrics.avgDaysOnMarket}` : 'N/A'}
          subtitle="Avg time to lease"
          icon={<Clock className="h-4 w-4 text-orange-600" />}
          isLoading={isLoading}
          tooltip={tooltips.avgDaysOnMarket}
          color="orange"
          trend={calculateTrend(metrics?.avgDaysOnMarket || 0, 'daysOnMarket')}
          sparkline={generateSparkline()}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Average Occupancy Term */}
        <MetricCard
          title="Avg Occupancy Term"
          value={metrics?.avgOccupancyTerm ? `${metrics.avgOccupancyTerm} months` : 'N/A'}
          subtitle="Average tenant duration"
          icon={<Calendar className="h-4 w-4 text-gray-600" />}
          isLoading={isLoading}
          tooltip={tooltips.avgTerm}
          trend={calculateTrend(metrics?.avgOccupancyTerm || 0, 'avgTerm')}
        />

        {/* Early Terminations */}
        <MetricCard
          title="Early Terminations"
          value={metrics?.earlyTerminations?.count || 0}
          subtitle={`${metrics?.earlyTerminations?.rate?.toFixed(1) || 0}% termination rate`}
          icon={<AlertCircle className="h-4 w-4 text-gray-600" />}
          isLoading={isLoading}
          tooltip={tooltips.earlyTerminations}
          trend={calculateTrend(metrics?.earlyTerminations?.rate || 0, 'terminations')}
        />

        {/* Month-to-Month */}
        <MetricCard
          title="Month-to-Month"
          value={metrics?.monthToMonth?.count || 0}
          subtitle={`${metrics?.monthToMonth?.percentage?.toFixed(1) || 0}% of occupied`}
          icon={<Calendar className="h-4 w-4 text-gray-600" />}
          isLoading={isLoading}
          tooltip={tooltips.monthToMonth}
          trend={calculateTrend(metrics?.monthToMonth?.percentage || 0, 'monthToMonth')}
        />

        {/* Average Owner Length */}
        <MetricCard
          title="Avg Owner Length"
          value={metrics?.owner?.avgYears ? `${metrics.owner.avgYears} years` : 'N/A'}
          subtitle={`${metrics?.owner?.totalProperties || 0} properties`}
          icon={<Users className="h-4 w-4 text-gray-600" />}
          isLoading={isLoading}
          tooltip={tooltips.avgOwnerLength}
        />

        {/* Outside Owners */}
        <MetricCard
          title="Outside Owners"
          value={metrics?.owner?.outsideOwners || 0}
          subtitle="Out-of-state"
          icon={<Users className="h-4 w-4 text-gray-600" />}
          isLoading={isLoading}
          tooltip={tooltips.outsideOwners}
        />

        {/* Leases This Month */}
        <MetricCard
          title="Leases This Month"
          value={metrics?.leasesSignedThisMonth || 0}
          subtitle="New leases signed"
          icon={<FileText className="h-4 w-4 text-gray-600" />}
          isLoading={isLoading}
          tooltip={tooltips.leasesSignedThisMonth}
          trend={calculateTrend(metrics?.leasesSignedThisMonth || 0, 'newLeases')}
        />
      </div>

      {/* Google Reviews - Special Card */}
      <Card className="bg-gradient-to-br from-yellow-50 to-orange-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CardTitle className="text-lg">Google Reviews</CardTitle>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-4 w-4 text-gray-400 cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-sm">{tooltips.googleReviews}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Badge variant="secondary">Coming Soon</Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={cn(
                    "h-5 w-5",
                    star <= (metrics?.googleReviews?.rating || 0)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  )}
                />
              ))}
            </div>
            <span className="text-2xl font-bold">
              {metrics?.googleReviews?.rating || 'N/A'}
            </span>
            <span className="text-sm text-gray-600">
              ({metrics?.googleReviews?.count || 0} reviews)
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
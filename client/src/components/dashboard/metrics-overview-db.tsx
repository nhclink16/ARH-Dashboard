import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { RefreshCw, TrendingUp, TrendingDown, Home, Users, Calendar, Clock, AlertCircle, Star, FileText, BarChart, Info } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ReactNode;
  trend?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
  tooltip?: string;
}

function MetricCard({ title, value, subtitle, icon, trend, isLoading, onRefresh, tooltip }: MetricCardProps) {
  return (
    <Card className="relative">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="flex items-center gap-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          {tooltip && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{tooltip}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
        </div>
        <div className="flex items-center gap-2">
          {icon}
          {onRefresh && (
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={onRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {isLoading ? (
            <span className="animate-pulse">Loading...</span>
          ) : (
            value || 'N/A'
          )}
        </div>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
        {trend !== undefined && (
          <div className="flex items-center pt-1">
            {trend > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-500" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-500" />
            )}
            <span className={`text-xs ml-1 ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
              {Math.abs(trend)}%
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

export default function MetricsOverviewDB() {
  const queryClient = useQueryClient();
  const [lastUpdated, setLastUpdated] = useState<string>('');

  // Fetch metrics from database (fast)
  const { data: metrics, isLoading, error } = useQuery({
    queryKey: ['operational-metrics-db'],
    queryFn: async () => {
      const response = await fetch('/api/metrics/operational/database');
      if (!response.ok) throw new Error('Failed to fetch metrics');
      const result = await response.json();
      setLastUpdated(result.data.lastUpdate || new Date().toISOString());
      return result.data;
    },
    refetchInterval: 60000, // Auto-refresh every minute
  });

  // Mutation to refresh from Buildium API
  const refreshFromBuildium = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/metrics/refresh', {
        method: 'POST',
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

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
        <p className="text-red-600">Error loading metrics: {error.message}</p>
      </div>
    );
  }

  // Tooltip definitions
  const tooltips = {
    occupancy: "Formula: (Occupied Units / Total Units) × 100\nSource: Rent Roll CSV\nUpdated: Monthly",
    avgRent: "Formula: Sum of occupied unit rents / Number of occupied units\nExcludes vacant units and $0 rents",
    rentRoll: "Total monthly rent from all occupied units\nFormula: Sum of all rents where unit is occupied",
    monthToMonth: "Percentage of leases on month-to-month terms\nFormula: MTM Leases / Total Active Leases × 100",
    avgTerm: "Average length of current occupancies in months\nCalculated from lease start dates",
    earlyTerminations: "Leases ended before their scheduled end date\nRate = Early Terminations / Total Completed Leases",
    avgOwnerLength: "Average years properties under management\nFormula: Average(Today - Management Start Date)",
    outsideOwners: "Owners with addresses outside property state\nRequires owner address data",
    leasesSignedThisMonth: "New leases with move-in dates in current month",
    avgDaysOnMarket: "Average days units remain vacant before leasing\nCalculated from vacancy periods",
    googleReviews: "Google Business reviews (requires Google Places API)",
  };

  return (
    <div className="space-y-6">
      {/* Header with refresh button */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Operational Metrics</h2>
          <p className="text-sm text-muted-foreground">
            Last updated: {formatLastUpdated(lastUpdated)}
          </p>
        </div>
        <Button
          onClick={() => refreshFromBuildium.mutate()}
          disabled={refreshFromBuildium.isPending}
          className="gap-2"
        >
          <RefreshCw className={refreshFromBuildium.isPending ? 'animate-spin' : ''} />
          Refresh from Buildium
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Occupancy Rate */}
        <MetricCard
          title="Occupancy Rate"
          value={metrics?.occupancy?.total ? `${metrics.occupancy.total.toFixed(1)}%` : 'N/A'}
          subtitle={`SFR: ${metrics?.occupancy?.sfr?.toFixed(1) || 0}% | MF: ${metrics?.occupancy?.mf?.toFixed(1) || 0}%`}
          icon={<Home className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.occupancy}
        />

        {/* Average Rent */}
        <MetricCard
          title="Average Rent"
          value={metrics?.rent?.averageRent?.total ? `$${metrics.rent.averageRent.total.toLocaleString()}` : 'N/A'}
          subtitle={`SFR: $${metrics?.rent?.averageRent?.sfr || 0} | MF: $${metrics?.rent?.averageRent?.mf || 0}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.avgRent}
        />

        {/* Total Rent Roll */}
        <MetricCard
          title="Total Rent Roll"
          value={metrics?.rent?.totalRentRoll ? `$${metrics.rent.totalRentRoll.toLocaleString()}` : 'N/A'}
          subtitle="Monthly recurring revenue"
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.rentRoll}
        />

        {/* Average Occupancy Term */}
        <MetricCard
          title="Avg Occupancy Term"
          value={metrics?.avgOccupancyTerm ? `${metrics.avgOccupancyTerm} months` : 'N/A'}
          subtitle="Average tenant duration"
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.avgTerm}
        />

        {/* Early Terminations */}
        <MetricCard
          title="Early Terminations"
          value={metrics?.earlyTerminations?.count || 0}
          subtitle={`${metrics?.earlyTerminations?.rate?.toFixed(1) || 0}% termination rate`}
          icon={<AlertCircle className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.earlyTerminations}
        />

        {/* Month-to-Month */}
        <MetricCard
          title="Month-to-Month"
          value={metrics?.monthToMonth?.count || 0}
          subtitle={`${metrics?.monthToMonth?.percentage?.toFixed(1) || 0}% of occupied units`}
          icon={<Calendar className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.monthToMonth}
        />

        {/* Average Owner Length */}
        <MetricCard
          title="Avg Owner Length"
          value={metrics?.owner?.avgYears ? `${metrics.owner.avgYears} years` : 'N/A'}
          subtitle={`${metrics?.owner?.totalProperties || 0} total properties`}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.avgOwnerLength}
        />

        {/* Outside Owners */}
        <MetricCard
          title="Outside Owners"
          value={metrics?.owner?.outsideOwners || 0}
          subtitle="Out-of-state owners"
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.outsideOwners}
        />

        {/* Average Days on Market */}
        <MetricCard
          title="Avg Days on Market"
          value={metrics?.avgDaysOnMarket ? `${metrics.avgDaysOnMarket} days` : 'N/A'}
          subtitle="Time to lease vacant units"
          icon={<Clock className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.avgDaysOnMarket}
        />

        {/* Google Reviews */}
        <MetricCard
          title="Google Reviews"
          value={metrics?.googleReviews?.rating || 'N/A'}
          subtitle={`${metrics?.googleReviews?.count || 0} reviews`}
          icon={<Star className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.googleReviews}
        />

        {/* Leases Signed This Month */}
        <MetricCard
          title="Leases This Month"
          value={metrics?.leasesSignedThisMonth || 0}
          subtitle="New leases signed"
          icon={<FileText className="h-4 w-4 text-muted-foreground" />}
          isLoading={isLoading}
          tooltip={tooltips.leasesSignedThisMonth}
        />
      </div>

      {/* Vacancy Distribution Chart Placeholder */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <CardTitle>Vacancy Duration Distribution</CardTitle>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-gray-400 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">Distribution of how long units remain vacant before being leased</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {metrics?.vacancyDistribution?.map((item: any) => (
              <div key={item.range} className="flex items-center justify-between">
                <span className="text-sm">{item.range}</span>
                <div className="flex items-center gap-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(item.count / 50) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
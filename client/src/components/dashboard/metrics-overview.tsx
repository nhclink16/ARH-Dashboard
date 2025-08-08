import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Home, DollarSign, TrendingUp, Calendar, Users, Building, Clock, FileText, Star, LogOut, RefreshCw } from "lucide-react";
import { PropertyType, DashboardMetrics } from "@/lib/types";
import { Metric } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface MetricsOverviewProps {
  activeFilter: PropertyType;
}

export default function MetricsOverview({ activeFilter }: MetricsOverviewProps) {
  const { toast } = useToast();
  
  const { data: metrics, isLoading, error } = useQuery<Metric[]>({
    queryKey: ['/api/metrics'],
  });

  const refreshOccupancyMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh-occupancy"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Occupancy Data Refreshed",
        description: data.message || "Occupancy rates updated from Buildium successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh occupancy data from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      toast({
        title: "Refresh Failed",
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refreshRentMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh-rent"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Rent Metrics Refreshed",
        description: data.message || "Rent roll and average rent updated from Buildium successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh rent metrics from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      toast({
        title: "Refresh Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refreshOccupancyTermMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh-occupancy-term"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Occupancy Term Data Refreshed",
        description: data.message || "Average term of occupancy updated from Buildium successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh occupancy term data from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      toast({
        title: "Refresh Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refreshEarlyTerminationsMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh-early-terminations"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Early Terminations Data Refreshed",
        description: data.message || "Early terminations data updated from Buildium successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh early terminations data from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      toast({
        title: "Refresh Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refreshMonthToMonthMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh-month-to-month"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Month-to-Month Data Refreshed",
        description: data.message || "Month-to-month lease data updated from Buildium successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh month-to-month data from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      toast({
        title: "Refresh Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refreshOwnerLengthMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh-owner-length"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Owner Length Data Refreshed",
        description: data.message || "Average owner length data updated from Buildium successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh owner length data from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      toast({
        title: "Refresh Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refreshOutsideOwnersMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh-outside-owners"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Outside Owners Data Refreshed",
        description: data.message || "Outside owners data updated from Buildium successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh outside owners data from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      toast({
        title: "Refresh Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refreshLeasesSignedMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh-leases-signed"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Leases Signed Data Refreshed",
        description: data.message || "Leases signed this month data updated from Buildium successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh leases signed data from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      toast({
        title: "Refresh Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  const refreshDaysOnMarketMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh-days-on-market"),
    onSuccess: async (response) => {
      const data = await response.json();
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      toast({
        title: "Days on Market Data Refreshed",
        description: data.message || "Average days on market data updated from Buildium successfully.",
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh days on market data from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        }
      } catch (e) {
        // Use default error message if parsing fails
      }
      
      toast({
        title: "Refresh Failed", 
        description: errorMessage,
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Operational Metrics Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="p-6">
              <Skeleton className="h-4 w-24 mb-2" />
              <Skeleton className="h-8 w-16 mb-4" />
              <Skeleton className="h-3 w-20" />
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-8">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Operational Metrics Overview</h2>
        <Card className="p-6">
          <p className="text-red-600">Failed to load metrics. Please try refreshing the page.</p>
        </Card>
      </div>
    );
  }

  const getMetricValue = (metricType: string, propertyType: string = 'total'): string => {
    const metric = metrics?.find(m => m.metricType === metricType && m.propertyType === propertyType);
    return metric?.stringValue || metric?.value?.toString() || 'N/A';
  };

  const getNumericValue = (metricType: string, propertyType: string = 'total'): number => {
    const metric = metrics?.find(m => m.metricType === metricType && m.propertyType === propertyType);
    return metric?.value || 0;
  };

  const primaryMetrics = [
    {
      title: "Occupancy Rate",
      value: getMetricValue('occupancy_rate', activeFilter === 'total' ? 'total' : activeFilter),
      icon: Home,
      color: "text-blue-600",
      isOccupancy: true,
      subMetrics: activeFilter === 'total' ? [
        { label: 'SFR', value: getMetricValue('occupancy_rate', 'sfr') },
        { label: 'MF', value: getMetricValue('occupancy_rate', 'mf') }
      ] : undefined
    },
    {
      title: "Total Rent Roll",
      value: getMetricValue('total_rent_roll'),
      icon: DollarSign,
      color: "text-green-600",
      description: "Monthly recurring revenue",
      isRent: true
    },
    {
      title: "Average Rent",
      value: getMetricValue('average_rent', activeFilter === 'total' ? 'total' : activeFilter),
      icon: TrendingUp,
      color: "text-blue-600",
      subMetrics: activeFilter === 'total' ? [
        { label: 'SFR', value: getMetricValue('average_rent', 'sfr') },
        { label: 'MF', value: getMetricValue('average_rent', 'mf') }
      ] : undefined,
      isRent: true
    },
    {
      title: "Google Reviews",
      value: getMetricValue('google_reviews'),
      icon: Star,
      color: "text-orange-600",
      description: `Average rating: ${getMetricValue('google_reviews_rating')}`
    }
  ];

  const secondaryMetrics = [
    {
      title: "Avg. Term of Occupancy",
      value: getMetricValue('avg_occupancy_term', activeFilter === 'total' ? 'total' : activeFilter),
      icon: Calendar,
      color: "text-gray-600",
      subMetrics: activeFilter === 'total' ? [
        { label: 'SFR', value: getMetricValue('avg_occupancy_term', 'sfr') },
        { label: 'MF', value: getMetricValue('avg_occupancy_term', 'mf') }
      ] : undefined,
      isOccupancyTerm: true
    },
    {
      title: "Vacated Within 6 Months",
      value: getMetricValue('early_terminations'),
      icon: LogOut,
      color: "text-orange-600",
      description: `${getMetricValue('early_termination_rate')} of total residents`,
      isEarlyTerminations: true
    },
    {
      title: "Month-to-Month",
      value: getMetricValue('month_to_month'),
      icon: Calendar,
      color: "text-blue-600",
      description: `${getMetricValue('month_to_month_percent')} of occupied units`,
      isMonthToMonth: true
    },
    {
      title: "Avg. Owner Length",
      value: getMetricValue('avg_owner_length', activeFilter === 'total' ? 'total' : activeFilter),
      icon: Users,
      color: "text-gray-600",
      subMetrics: activeFilter === 'total' ? [
        { label: 'SFR', value: getMetricValue('avg_owner_length', 'sfr') },
        { label: '3rd Party MF', value: getMetricValue('avg_owner_length', 'mf') }
      ] : undefined,
      isOwnerLength: true
    },
    {
      title: "Outside Owners",
      value: getMetricValue('outside_owners', activeFilter === 'total' ? 'total' : activeFilter),
      icon: Building,
      color: "text-green-600",
      subMetrics: activeFilter === 'total' ? [
        { label: 'SFR', value: getMetricValue('outside_owners', 'sfr') },
        { label: 'MF', value: getMetricValue('outside_owners', 'mf') }
      ] : undefined,
      isOutsideOwners: true
    },
    {
      title: "Avg. Days on Market",
      value: getMetricValue('avg_days_on_market', activeFilter === 'total' ? 'total' : activeFilter),
      icon: Clock,
      color: "text-orange-600",
      subMetrics: activeFilter === 'total' ? [
        { label: 'SFR', value: getMetricValue('avg_days_on_market', 'sfr') },
        { label: 'MF', value: getMetricValue('avg_days_on_market', 'mf') }
      ] : undefined,
      isDaysOnMarket: true
    },
    {
      title: "Leases Signed This Month",
      value: getMetricValue('leases_signed_month', activeFilter === 'total' ? 'total' : activeFilter),
      icon: FileText,
      color: "text-green-600",
      subMetrics: activeFilter === 'total' ? [
        { label: 'SFR', value: getMetricValue('leases_signed_month', 'sfr') },
        { label: 'MF', value: getMetricValue('leases_signed_month', 'mf') }
      ] : undefined,
      isLeasesSigned: true
    }
  ];

  return (
    <div className="mb-8">
      <h2 className="text-lg font-medium text-gray-900 mb-4">Operational Metrics Overview</h2>
      
      {/* Key Performance Indicators */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {primaryMetrics.map((metric, index) => (
          <Card key={index} className="metric-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <metric.icon className={`h-5 w-5 ${metric.color}`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                    <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {(metric as any).isOccupancy && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshOccupancyMutation.mutate()}
                      disabled={refreshOccupancyMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshOccupancyMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  {(metric as any).isRent && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshRentMutation.mutate()}
                      disabled={refreshRentMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshRentMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  
                </div>
              </div>
              {metric.subMetrics && (
                <div className="mt-4">
                  <div className="flex text-xs text-gray-500 space-x-4">
                    {metric.subMetrics.map((sub, i) => (
                      <span key={i}>{sub.label}: {sub.value}</span>
                    ))}
                  </div>
                </div>
              )}
              {metric.description && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Secondary Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {secondaryMetrics.map((metric, index) => (
          <Card key={index} className="metric-card hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                    <p className="text-xl font-semibold text-gray-900">{metric.value}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {(metric as any).isOccupancyTerm && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshOccupancyTermMutation.mutate()}
                      disabled={refreshOccupancyTermMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshOccupancyTermMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  {(metric as any).isEarlyTerminations && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshEarlyTerminationsMutation.mutate()}
                      disabled={refreshEarlyTerminationsMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshEarlyTerminationsMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  {(metric as any).isMonthToMonth && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshMonthToMonthMutation.mutate()}
                      disabled={refreshMonthToMonthMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshMonthToMonthMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  {(metric as any).isOwnerLength && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshOwnerLengthMutation.mutate()}
                      disabled={refreshOwnerLengthMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshOwnerLengthMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  {(metric as any).isOutsideOwners && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshOutsideOwnersMutation.mutate()}
                      disabled={refreshOutsideOwnersMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshOutsideOwnersMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  {(metric as any).isLeasesSigned && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshLeasesSignedMutation.mutate()}
                      disabled={refreshLeasesSignedMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshLeasesSignedMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                  {(metric as any).isDaysOnMarket && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => refreshDaysOnMarketMutation.mutate()}
                      disabled={refreshDaysOnMarketMutation.isPending}
                      className="text-blue-600 hover:text-blue-700 border-blue-200 hover:border-blue-300"
                    >
                      <RefreshCw className={`h-3 w-3 ${refreshDaysOnMarketMutation.isPending ? 'animate-spin' : ''}`} />
                    </Button>
                  )}
                </div>
              </div>
              {metric.subMetrics && (
                <div className="mt-4">
                  <div className="text-xs text-gray-500 space-y-1">
                    {metric.subMetrics.map((sub, i) => (
                      <div key={i}>{sub.label}: {sub.value}</div>
                    ))}
                  </div>
                </div>
              )}
              {metric.description && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

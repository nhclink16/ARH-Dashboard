import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Download } from "lucide-react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function DashboardHeader() {
  const [lastUpdated, setLastUpdated] = useState<string>("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query to get metrics and derive last updated time
  const { data: metrics } = useQuery<any[]>({
    queryKey: ['/api/metrics'],
  });

  // Update last updated time based on metrics data
  useEffect(() => {
    if (metrics && Array.isArray(metrics) && metrics.length > 0) {
      // Find the most recent lastUpdated timestamp from all metrics
      const mostRecent = metrics.reduce((latest: string, metric: any) => {
        const metricTime = new Date(metric.lastUpdated).getTime();
        const latestTime = latest ? new Date(latest).getTime() : 0;
        return metricTime > latestTime ? metric.lastUpdated : latest;
      }, "");

      if (mostRecent) {
        const date = new Date(mostRecent);
        const now = new Date();
        const isToday = date.toDateString() === now.toDateString();
        
        if (isToday) {
          setLastUpdated(`Today, ${date.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit',
            hour12: true 
          })}`);
        } else {
          setLastUpdated(date.toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          }));
        }
      }
    } else {
      setLastUpdated("Never");
    }
  }, [metrics]);

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/metrics/refresh"),
    onSuccess: async (response) => {
      const data = await response.json();
      
      // Invalidate all queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['/api/metrics'] });
      queryClient.invalidateQueries({ queryKey: ['/api/vacancy-distribution'] });
      
      // Update last updated time
      const now = new Date();
      setLastUpdated(`Today, ${now.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true 
      })}`);
      
      toast({
        title: "All Metrics Refreshed",
        description: data.message || `Successfully refreshed ${data.refreshedCount || 'all'} metrics from Buildium`,
      });
    },
    onError: async (error: any) => {
      let errorMessage = "Failed to refresh metrics from Buildium.";
      try {
        if (error instanceof Response) {
          const errorData = await error.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
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

  const exportMutation = useMutation({
    mutationFn: () => apiRequest("GET", "/api/metrics/export"),
    onSuccess: async (response) => {
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'augusta-rental-metrics.json';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export Complete",
        description: "Metrics data has been exported successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Export Failed",
        description: "Failed to export metrics data. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleRefresh = () => {
    refreshMutation.mutate();
  };

  const handleExport = () => {
    exportMutation.mutate();
  };

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Desktop Layout */}
        <div className="hidden sm:flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-semibold text-gray-900">Augusta Rental Homes</h1>
              <p className="text-sm text-gray-500">Property Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-sm text-gray-500">
              <span>Last updated: {lastUpdated}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshMutation.isPending}
              className="augusta-primary hover:augusta-bg-primary hover:text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
              {refreshMutation.isPending ? 'Refreshing...' : 'Refresh All'}
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              disabled={exportMutation.isPending}
              className="augusta-bg-primary hover:augusta-bg-primary text-white"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportMutation.isPending ? 'Exporting...' : 'Export'}
            </Button>
          </div>
        </div>

        {/* Mobile Layout */}
        <div className="sm:hidden">
          {/* Top row with title */}
          <div className="flex justify-between items-center h-14 border-b border-gray-100">
            <div className="flex-1 min-w-0">
              <h1 className="text-lg font-semibold text-gray-900 truncate">Augusta Rental Homes</h1>
              <p className="text-xs text-gray-500">Property Management Dashboard</p>
            </div>
          </div>
          
          {/* Bottom row with actions */}
          <div className="flex justify-between items-center h-12 px-1">
            <div className="text-xs text-gray-500 flex-1 min-w-0">
              <span className="truncate">Updated: {lastUpdated}</span>
            </div>
            <div className="flex items-center space-x-2 ml-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshMutation.isPending}
                className="augusta-primary hover:augusta-bg-primary hover:text-white text-xs px-2 py-1 h-8"
              >
                <RefreshCw className={`h-3 w-3 ${refreshMutation.isPending ? 'animate-spin mr-1' : 'mr-1'}`} />
                {refreshMutation.isPending ? 'Refreshing' : 'Refresh'}
              </Button>
              <Button
                size="sm"
                onClick={handleExport}
                disabled={exportMutation.isPending}
                className="augusta-bg-primary hover:augusta-bg-primary text-white text-xs px-2 py-1 h-8"
              >
                <Download className="h-3 w-3 mr-1" />
                {exportMutation.isPending ? 'Exporting' : 'Export'}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

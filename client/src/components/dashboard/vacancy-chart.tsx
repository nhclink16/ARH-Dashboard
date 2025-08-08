import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { PropertyType } from "@/lib/types";
import { VacancyDistribution } from "@shared/schema";
import { TrendingUp, RotateCcw } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface VacancyChartProps {
  activeFilter: PropertyType;
}

export default function VacancyChart({ activeFilter }: VacancyChartProps) {
  const [chartFilter, setChartFilter] = useState<PropertyType>('total');
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vacancyData, isLoading, error } = useQuery<VacancyDistribution[]>({
    queryKey: ['/api/vacancy-distribution'],
  });

  const refreshMutation = useMutation({
    mutationFn: () => apiRequest('POST', '/api/vacancy-distribution/refresh'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/vacancy-distribution'] });
      toast({
        title: "Success",
        description: "Vacancy distribution updated with latest Buildium data",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to refresh vacancy distribution",
        variant: "destructive",
      });
    },
  });

  if (isLoading) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <Skeleton className="h-6 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="w-full h-80" />
      </Card>
    );
  }

  if (error || !vacancyData) {
    return (
      <Card className="p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-lg font-medium text-gray-900">Vacancy Duration Distribution</h3>
            <p className="text-sm text-gray-500">Distribution of days vacant for currently vacant units</p>
          </div>
        </div>
        <p className="text-red-600">Failed to load vacancy distribution data.</p>
      </Card>
    );
  }

  const getChartData = (propertyType: PropertyType) => {
    // Map property type for data filtering - 'total' maps to 'all' in our Buildium data
    const filterType = propertyType === 'total' ? 'all' : propertyType;
    const filteredData = vacancyData.filter(item => item.propertyType === filterType);
    
    // Map our Buildium API data structure to chart format
    const chartLabels = [
      { key: '0-30 days', label: '0-30 days' },
      { key: '31-60 days', label: '31-60 days' },
      { key: '61-90 days', label: '61-90 days' },
      { key: '90+ days', label: '90+ days' }
    ];

    return chartLabels.map(({ key, label }) => {
      const item = filteredData.find(d => d.daysRange === key);
      return {
        name: label,
        count: item?.count || 0
      };
    });
  };

  const getSummaryData = (propertyType: PropertyType) => {
    // Map property type for data filtering - 'total' maps to 'all' in our Buildium data
    const filterType = propertyType === 'total' ? 'all' : propertyType;
    const filteredData = vacancyData.filter(item => item.propertyType === filterType);
    
    return {
      days0to30: filteredData.find(d => d.daysRange === '0-30 days')?.count || 0,
      days31to60: filteredData.find(d => d.daysRange === '31-60 days')?.count || 0,
      days61to90: filteredData.find(d => d.daysRange === '61-90 days')?.count || 0,
      days90plus: filteredData.find(d => d.daysRange === '90+ days')?.count || 0,
    };
  };

  const chartData = getChartData(chartFilter);
  const summaryData = getSummaryData(chartFilter);

  const filterButtons = [
    { id: 'total' as PropertyType, label: 'All Properties' },
    { id: 'sfr' as PropertyType, label: 'SFR Only' },
    { id: 'mf' as PropertyType, label: 'MF Only' },
  ];

  return (
    <Card className="p-4 sm:p-6 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6">
        <div className="mb-3 sm:mb-0">
          <h3 className="text-base sm:text-lg font-medium text-gray-900">Vacancy Duration Distribution</h3>
          <p className="text-xs sm:text-sm text-gray-500">Distribution of days vacant for currently vacant units</p>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-gray-400 hover:text-gray-600 self-start sm:self-auto"
          onClick={() => refreshMutation.mutate()}
          disabled={refreshMutation.isPending}
        >
          <RotateCcw className={`h-4 w-4 ${refreshMutation.isPending ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Chart Filters */}
      <div className="mb-4 sm:mb-6">
        <div className="flex flex-wrap gap-2 sm:gap-4">
          {filterButtons.map((button) => (
            <Button
              key={button.id}
              variant={chartFilter === button.id ? "default" : "outline"}
              size="sm"
              onClick={() => setChartFilter(button.id)}
              className={chartFilter === button.id ? "augusta-bg-primary text-white" : ""}
            >
              {button.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="w-full h-64 sm:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              tickLine={false}
              axisLine={false}
            />
            <Bar 
              dataKey="count" 
              fill="var(--augusta-primary)"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{summaryData.days0to30}</p>
          <p className="text-xs text-gray-500">0-30 days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{summaryData.days31to60}</p>
          <p className="text-xs text-gray-500">31-60 days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{summaryData.days61to90}</p>
          <p className="text-xs text-gray-500">61-90 days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{summaryData.days90plus}</p>
          <p className="text-xs text-gray-500">90+ days</p>
        </div>
      </div>
    </Card>
  );
}

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { PropertyType } from "@/lib/types";
import { VacancyDistribution } from "@shared/schema";
import { TrendingUp, RotateCcw, Building2, Home } from "lucide-react";
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
    // Get data for both SF and MF to show in combined chart
    const chartLabels = [
      { key: '0-14 days', label: '0-14 days' },
      { key: '15-30 days', label: '15-30 days' },
      { key: '31-60 days', label: '31-60 days' },
      { key: '61-90 days', label: '61-90 days' },
      { key: '90+ days', label: '90+ days' }
    ];

    if (propertyType === 'total') {
      // Show both SF and MF in the same chart with different colors
      const sfrData = vacancyData.filter(item => item.propertyType === 'sfr');
      const mfData = vacancyData.filter(item => item.propertyType === 'mf');
      
      return chartLabels.map(({ key, label }) => {
        const sfrItem = sfrData.find(d => d.daysRange === key);
        const mfItem = mfData.find(d => d.daysRange === key);
        return {
          name: label,
          SF: sfrItem?.count || 0,
          MF: mfItem?.count || 0,
          Total: (sfrItem?.count || 0) + (mfItem?.count || 0)
        };
      });
    } else {
      // Show single property type
      const filterType = propertyType === 'total' ? 'all' : propertyType;
      const filteredData = vacancyData.filter(item => item.propertyType === filterType);
      
      return chartLabels.map(({ key, label }) => {
        const item = filteredData.find(d => d.daysRange === key);
        return {
          name: label,
          count: item?.count || 0
        };
      });
    }
  };

  const getSummaryData = (propertyType: PropertyType) => {
    if (propertyType === 'total') {
      // Combine SF and MF data for total view
      const sfrData = vacancyData.filter(item => item.propertyType === 'sfr');
      const mfData = vacancyData.filter(item => item.propertyType === 'mf');
      
      return {
        days0to14: (sfrData.find(d => d.daysRange === '0-14 days')?.count || 0) + 
                   (mfData.find(d => d.daysRange === '0-14 days')?.count || 0),
        days15to30: (sfrData.find(d => d.daysRange === '15-30 days')?.count || 0) + 
                    (mfData.find(d => d.daysRange === '15-30 days')?.count || 0),
        days31to60: (sfrData.find(d => d.daysRange === '31-60 days')?.count || 0) + 
                    (mfData.find(d => d.daysRange === '31-60 days')?.count || 0),
        days61to90: (sfrData.find(d => d.daysRange === '61-90 days')?.count || 0) + 
                    (mfData.find(d => d.daysRange === '61-90 days')?.count || 0),
        days90plus: (sfrData.find(d => d.daysRange === '90+ days')?.count || 0) + 
                    (mfData.find(d => d.daysRange === '90+ days')?.count || 0),
      };
    } else {
      // Single property type
      const filterType = propertyType === 'total' ? 'all' : propertyType;
      const filteredData = vacancyData.filter(item => item.propertyType === filterType);
      
      return {
        days0to14: filteredData.find(d => d.daysRange === '0-14 days')?.count || 0,
        days15to30: filteredData.find(d => d.daysRange === '15-30 days')?.count || 0,
        days31to60: filteredData.find(d => d.daysRange === '31-60 days')?.count || 0,
        days61to90: filteredData.find(d => d.daysRange === '61-90 days')?.count || 0,
        days90plus: filteredData.find(d => d.daysRange === '90+ days')?.count || 0,
      };
    }
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
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            {chartFilter === 'total' ? (
              <>
                <Legend 
                  verticalAlign="top" 
                  height={36}
                  iconType="rect"
                  formatter={(value: string) => {
                    if (value === 'SF') return 'Single-Family';
                    if (value === 'MF') return 'Multi-Family';
                    return value;
                  }}
                />
                <Bar 
                  dataKey="SF" 
                  fill="#10b981"
                  stackId="a"
                  radius={[0, 0, 0, 0]}
                  name="SF"
                />
                <Bar 
                  dataKey="MF" 
                  fill="#3b82f6"
                  stackId="a"
                  radius={[4, 4, 0, 0]}
                  name="MF"
                />
              </>
            ) : (
              <Bar 
                dataKey="count" 
                fill={chartFilter === 'sfr' ? '#10b981' : '#3b82f6'}
                radius={[4, 4, 0, 0]}
              />
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Summary */}
      <div className="mt-6 grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{summaryData.days0to14}</p>
          <p className="text-xs text-gray-500">0-14 days</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-semibold text-gray-900">{summaryData.days15to30}</p>
          <p className="text-xs text-gray-500">15-30 days</p>
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

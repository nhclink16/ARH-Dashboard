import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Timer, Users, DollarSign, Target, TrendingUp } from "lucide-react";
import { Metric } from "@shared/schema";

export default function SalesDashboard() {
  const { data: metrics, isLoading, error } = useQuery<Metric[]>({
    queryKey: ['/api/metrics'],
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Customer acquisition, lifetime value, and sales performance</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {Array.from({ length: 6 }).map((_, i) => (
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
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
          <p className="text-gray-600 mt-1">Customer acquisition, lifetime value, and sales performance</p>
        </div>
        
        <Card className="p-6">
          <p className="text-red-600">Failed to load sales metrics. Please try refreshing the page.</p>
        </Card>
      </div>
    );
  }

  const getMetricValue = (metricType: string, propertyType: string = 'total'): string => {
    const metric = metrics?.find(m => m.metricType === metricType && m.propertyType === propertyType);
    return metric?.stringValue || metric?.value?.toString() || 'N/A';
  };

  const salesMetrics = [
    {
      title: "Time to Revenue",
      value: getMetricValue('time_to_revenue'),
      icon: Timer,
      color: "text-blue-600",
      description: "From entry in Buildium to first payment"
    },
    {
      title: "Customer LTV (SFR)",
      value: getMetricValue('customer_ltv_sfr', 'sfr'),
      icon: DollarSign,
      color: "text-green-600",
      description: "Single-family rental lifetime value"
    },
    {
      title: "Customer LTV (3rd Party MF)",
      value: getMetricValue('customer_ltv_mf', 'mf'),
      icon: DollarSign,
      color: "text-green-600",
      description: "Multi-family lifetime value"
    },
    {
      title: "Customer Acquisition Cost",
      value: getMetricValue('customer_acquisition_cost', 'sfr'),
      icon: Users,
      color: "text-orange-600",
      description: "Cost to acquire new SFR customer"
    },
    {
      title: "Lead Closing Ratio",
      value: getMetricValue('closing_ratio'),
      icon: Target,
      color: "text-purple-600",
      description: "Percentage of leads that become customers"
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Sales Dashboard</h1>
        <p className="text-gray-600 mt-1">Customer acquisition, lifetime value, and sales performance</p>
      </div>

      {/* Integration Status */}
      <Card className="mb-6 border-green-200 bg-green-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-green-500 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-green-900">Buildium Integration Active</p>
                <p className="text-sm text-green-700">Customer data synced from property management system</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-green-100 text-green-800">Connected</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sales Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
        {salesMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <metric.icon className={`h-5 w-5 ${metric.color}`} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-500">{metric.title}</p>
                  <p className="text-2xl font-semibold text-gray-900">{metric.value}</p>
                </div>
              </div>
              {metric.description && (
                <div className="mt-4">
                  <p className="text-xs text-gray-500">{metric.description}</p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Sales Performance Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
              Customer Lifetime Value Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">Single Family Rental</p>
                  <p className="text-sm text-gray-600">Average customer value</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{getMetricValue('customer_ltv_sfr', 'sfr')}</p>
              </div>
              <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                <div>
                  <p className="font-medium text-gray-900">3rd Party Multi-Family</p>
                  <p className="text-sm text-gray-600">Average customer value</p>
                </div>
                <p className="text-2xl font-bold text-green-600">{getMetricValue('customer_ltv_mf', 'mf')}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Target className="h-5 w-5 mr-2 text-purple-600" />
              Sales Efficiency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm font-medium text-gray-700">Lead Closing Ratio</p>
                  <p className="text-sm font-bold text-purple-600">{getMetricValue('closing_ratio')}</p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-purple-600 h-2 rounded-full" 
                    style={{ width: `${Math.min(100, parseFloat(getMetricValue('closing_ratio').replace('%', '')))}%` }}
                  ></div>
                </div>
              </div>
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600">
                  Time from Buildium entry to first revenue: <span className="font-medium text-gray-900">{getMetricValue('time_to_revenue')}</span>
                </p>
                <p className="text-sm text-gray-600 mt-1">
                  Customer acquisition cost: <span className="font-medium text-gray-900">{getMetricValue('customer_acquisition_cost', 'sfr')}</span>
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Sales Performance Insights</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Customer Value</h4>
              <p className="text-sm text-gray-600">
                SFR customers have a higher lifetime value ({getMetricValue('customer_ltv_sfr', 'sfr')}) compared to 
                multi-family customers ({getMetricValue('customer_ltv_mf', 'mf')}), making them more profitable long-term.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Conversion Efficiency</h4>
              <p className="text-sm text-gray-600">
                With a {getMetricValue('closing_ratio')} closing ratio and {getMetricValue('time_to_revenue')} time to revenue, 
                the sales process is performing well compared to industry benchmarks.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
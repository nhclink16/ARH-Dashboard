import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { DollarSign, TrendingUp, Banknote, Building2, RefreshCw, ExternalLink } from "lucide-react";
import { Metric } from "@shared/schema";

export default function FinancialDashboard() {
  const { data: metrics, isLoading, error } = useQuery<Metric[]>({
    queryKey: ['/api/metrics'],
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-1">Revenue, EBITDA, cash flow and financial performance</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {Array.from({ length: 8 }).map((_, i) => (
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
          <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
          <p className="text-gray-600 mt-1">Revenue, EBITDA, cash flow and financial performance</p>
        </div>
        
        <Card className="p-6">
          <p className="text-red-600">Failed to load financial metrics. Please try refreshing the page.</p>
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

  const primaryFinancialMetrics = [
    {
      title: "Monthly Revenue",
      value: getMetricValue('monthly_revenue'),
      icon: DollarSign,
      color: "text-green-600",
      description: "Current month revenue"
    },
    {
      title: "YTD Revenue",
      value: getMetricValue('ytd_revenue'),
      icon: TrendingUp,
      color: "text-blue-600",
      description: "Year-to-date total"
    },
    {
      title: "YoY Growth",
      value: getMetricValue('yoy_growth'),
      icon: TrendingUp,
      color: "text-green-600",
      description: "Year-over-year growth"
    },
    {
      title: "EBITDA",
      value: getMetricValue('ebitda'),
      icon: Banknote,
      color: "text-purple-600",
      description: `Margin: ${getMetricValue('ebitda_margin')}`
    }
  ];

  const secondaryFinancialMetrics = [
    {
      title: "Cash in Operating Account",
      value: getMetricValue('cash_operating'),
      icon: Banknote,
      color: "text-green-600",
      description: "Available operating capital"
    },
    {
      title: "Company Valuation",
      value: getMetricValue('company_value'),
      icon: Building2,
      color: "text-gray-600",
      description: "Estimated company value"
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Financial Dashboard</h1>
        <p className="text-gray-600 mt-1">Revenue, EBITDA, cash flow and financial performance</p>
      </div>

      {/* QuickBooks Integration Status */}
      <Card className="mb-6 border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-3 w-3 bg-orange-400 rounded-full mr-3"></div>
              <div>
                <p className="font-medium text-blue-900">QuickBooks Online Integration</p>
                <p className="text-sm text-blue-700">Connect QBO to automatically sync financial data</p>
              </div>
            </div>
            <Button variant="outline" className="border-blue-300 text-blue-700 hover:bg-blue-100">
              <ExternalLink className="h-4 w-4 mr-2" />
              Connect QBO
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Primary Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {primaryFinancialMetrics.map((metric, index) => (
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

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-8">
        {secondaryFinancialMetrics.map((metric, index) => (
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

      {/* Financial Insights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
            Financial Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Revenue Performance</h4>
              <p className="text-sm text-gray-600">
                Year-over-year revenue growth of {getMetricValue('yoy_growth')} indicates strong business expansion. 
                Monthly revenue of {getMetricValue('monthly_revenue')} is tracking well against annual targets.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-gray-900 mb-2">Profitability</h4>
              <p className="text-sm text-gray-600">
                EBITDA margin of {getMetricValue('ebitda_margin')} demonstrates healthy operational efficiency. 
                Cash position of {getMetricValue('cash_operating')} provides strong operational flexibility.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
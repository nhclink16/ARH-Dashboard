import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Megaphone, DollarSign, MousePointer, ExternalLink, AlertCircle } from "lucide-react";
import { Metric } from "@shared/schema";

export default function MarketingDashboard() {
  const { data: metrics, isLoading, error } = useQuery<Metric[]>({
    queryKey: ['/api/metrics'],
  });

  if (isLoading) {
    return (
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>
          <p className="text-gray-600 mt-1">Marketing spend, channel performance, and ROI analysis</p>
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
          <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>
          <p className="text-gray-600 mt-1">Marketing spend, channel performance, and ROI analysis</p>
        </div>
        
        <Card className="p-6">
          <p className="text-red-600">Failed to load marketing metrics. Please try refreshing the page.</p>
        </Card>
      </div>
    );
  }

  const getMetricValue = (metricType: string, propertyType: string = 'total'): string => {
    const metric = metrics?.find(m => m.metricType === metricType && m.propertyType === propertyType);
    return metric?.stringValue || metric?.value?.toString() || 'N/A';
  };

  const marketingMetrics = [
    {
      title: "Total Marketing Spend",
      value: getMetricValue('marketing_spend_total'),
      icon: DollarSign,
      color: "text-green-600",
      description: "This month's marketing investment"
    },
    {
      title: "Google Ads Spend",
      value: getMetricValue('marketing_spend_google'),
      icon: Megaphone,
      color: "text-blue-600",
      description: "Google advertising costs"
    },
    {
      title: "Facebook/Meta Spend",
      value: getMetricValue('marketing_spend_facebook'),
      icon: Megaphone,
      color: "text-blue-600",
      description: "Social media advertising costs"
    },
    {
      title: "Cost Per Click",
      value: getMetricValue('cost_per_click'),
      icon: MousePointer,
      color: "text-orange-600",
      description: "Average cost per click across channels"
    }
  ];

  const upcomingChannels = [
    {
      name: "Google Ads",
      description: "Search and display advertising for property management services",
      status: "Planned",
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Facebook/Instagram Ads", 
      description: "Social media advertising targeting property owners",
      status: "Planned",
      color: "bg-blue-100 text-blue-800"
    },
    {
      name: "Local SEO",
      description: "Search engine optimization for local property management",
      status: "Research",
      color: "bg-gray-100 text-gray-800"
    },
    {
      name: "Content Marketing",
      description: "Blog posts and educational content for property owners",
      status: "Research", 
      color: "bg-gray-100 text-gray-800"
    }
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Marketing Dashboard</h1>
        <p className="text-gray-600 mt-1">Marketing spend, channel performance, and ROI analysis</p>
      </div>

      {/* Marketing Launch Status */}
      <Card className="mb-6 border-yellow-200 bg-yellow-50">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <AlertCircle className="h-5 w-5 text-yellow-600 mr-3" />
              <div>
                <p className="font-medium text-yellow-900">Marketing Launch Pending</p>
                <p className="text-sm text-yellow-700">Augusta Rental Homes marketing campaigns are in planning phase</p>
              </div>
            </div>
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Coming Soon</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Current Marketing Metrics (All $0) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
        {marketingMetrics.map((metric, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow opacity-75">
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

      {/* Planned Marketing Channels */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Megaphone className="h-5 w-5 mr-2 text-blue-600" />
            Planned Marketing Channels
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingChannels.map((channel, index) => (
              <div key={index} className="p-4 border rounded-lg hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-gray-900">{channel.name}</h4>
                  <Badge className={channel.color}>{channel.status}</Badge>
                </div>
                <p className="text-sm text-gray-600">{channel.description}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Marketing Strategy Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Primary Market</h4>
                <p className="text-sm text-gray-600">
                  Property owners in Augusta area looking for professional management services for single-family rentals and small multi-family properties.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Secondary Market</h4>
                <p className="text-sm text-gray-600">
                  Out-of-state investors seeking local property management expertise for their Augusta rental portfolio.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Launch Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Phase 1: Foundation</h4>
                <p className="text-sm text-gray-600">
                  Establish online presence, optimize website, set up tracking systems, and create initial content.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Phase 2: Paid Advertising</h4>
                <p className="text-sm text-gray-600">
                  Launch Google Ads and Facebook campaigns with careful budget allocation and performance monitoring.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Integration Setup */}
      <Card>
        <CardHeader>
          <CardTitle>Marketing Integrations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-gray-400 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">Google Ads</p>
                  <p className="text-sm text-gray-600">Ready for integration when campaigns launch</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Later
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-gray-400 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">Facebook Business Manager</p>
                  <p className="text-sm text-gray-600">Ready for integration when campaigns launch</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Later
              </Button>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center">
                <div className="h-3 w-3 bg-gray-400 rounded-full mr-3"></div>
                <div>
                  <p className="font-medium text-gray-900">Google Analytics</p>
                  <p className="text-sm text-gray-600">Website tracking and conversion measurement</p>
                </div>
              </div>
              <Button variant="outline" size="sm" disabled>
                <ExternalLink className="h-4 w-4 mr-2" />
                Connect Later
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
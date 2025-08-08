import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, ExternalLink } from "lucide-react";

export default function IntegrationsStatus() {
  const integrations = [
    {
      name: "Buildium Integration",
      status: "Connected",
      lastSync: "8:30 AM",
      statusColor: "text-green-600",
      bgColor: "bg-green-50"
    },
    {
      name: "QuickBooks Integration", 
      status: "Connected",
      lastSync: "8:15 AM",
      statusColor: "text-green-600",
      bgColor: "bg-green-50"
    }
  ];

  return (
    <Card className="p-4 sm:p-6">
      <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-4">System Integrations Status</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
        {integrations.map((integration, index) => (
          <div key={index} className={`flex items-center justify-between p-3 sm:p-4 ${integration.bgColor} rounded-lg`}>
            <div className="flex items-center min-w-0 flex-1">
              <div className="flex-shrink-0">
                <CheckCircle className={`h-4 w-4 sm:h-5 sm:w-5 ${integration.statusColor}`} />
              </div>
              <div className="ml-2 sm:ml-3 min-w-0">
                <p className={`text-xs sm:text-sm font-medium ${integration.statusColor} truncate`}>{integration.name}</p>
                <p className={`text-xs ${integration.statusColor} opacity-80`}>
                  {integration.status} - Last sync: {integration.lastSync}
                </p>
              </div>
            </div>
            <Button variant="ghost" size="sm" className={`${integration.statusColor} hover:${integration.statusColor} ml-2 flex-shrink-0`}>
              <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4" />
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
}

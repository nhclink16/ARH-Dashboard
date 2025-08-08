import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { BarChart3, DollarSign, TrendingUp, Megaphone } from "lucide-react";

interface TabNavigationProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  children: React.ReactNode;
}

export default function TabNavigation({ activeTab, onTabChange, children }: TabNavigationProps) {
  const tabs = [
    {
      id: 'operational',
      label: 'Operational',
      icon: BarChart3,
      description: 'Property management KPIs'
    },
    {
      id: 'sales',
      label: 'Sales',
      icon: TrendingUp,
      description: 'Customer acquisition & LTV'
    },
    {
      id: 'financial',
      label: 'Financial',
      icon: DollarSign,
      description: 'Revenue, EBITDA & cash flow'
    },
    {
      id: 'marketing',
      label: 'Marketing',
      icon: Megaphone,
      description: 'Spend & channel performance'
    }
  ];

  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <div className="border-b bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TabsList className="grid w-full grid-cols-4 bg-transparent h-auto p-0 gap-0">
            {tabs.map((tab) => {
              const IconComponent = tab.icon;
              return (
                <TabsTrigger
                  key={tab.id}
                  value={tab.id}
                  className="flex flex-col items-center justify-center p-4 text-sm font-medium border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:bg-blue-50/50 hover:text-gray-700 hover:border-gray-300 transition-all duration-200 bg-transparent"
                >
                  <IconComponent className="h-5 w-5 mb-1" />
                  <span className="font-semibold">{tab.label}</span>
                  <span className="text-xs text-gray-500 mt-0.5 hidden sm:block">{tab.description}</span>
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
      </div>
      
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </div>
      </div>
    </Tabs>
  );
}
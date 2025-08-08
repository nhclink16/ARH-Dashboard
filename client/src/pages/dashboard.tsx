import { useState } from "react";
import { TabsContent } from "@/components/ui/tabs";
import DashboardHeader from "@/components/dashboard/dashboard-header";
import TabNavigation from "@/components/navigation/tab-navigation";
import OperationalDashboard from "./operational-dashboard";
import SalesDashboard from "./sales-dashboard";
import FinancialDashboard from "./financial-dashboard";
import MarketingDashboard from "./marketing-dashboard";

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState('operational');

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab}>
        <TabsContent value="operational">
          <OperationalDashboard />
        </TabsContent>
        
        <TabsContent value="sales">
          <SalesDashboard />
        </TabsContent>
        
        <TabsContent value="financial">
          <FinancialDashboard />
        </TabsContent>
        
        <TabsContent value="marketing">
          <MarketingDashboard />
        </TabsContent>
      </TabNavigation>
    </div>
  );
}

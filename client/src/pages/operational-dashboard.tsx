import { useState } from "react";
import FilterTabs from "@/components/dashboard/filter-tabs";
import MetricsOverview from "@/components/dashboard/metrics-overview";
import VacancyChart from "@/components/dashboard/vacancy-chart";
import IntegrationsStatus from "@/components/dashboard/integrations-status";
import { PropertyType } from "@/lib/types";

export default function OperationalDashboard() {
  const [activeFilter, setActiveFilter] = useState<PropertyType>('total');

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Operational Metrics</h1>
        <p className="text-gray-600 mt-1">Property management KPIs, occupancy rates, and operational performance</p>
      </div>
      
      <FilterTabs activeFilter={activeFilter} onFilterChange={setActiveFilter} />
      <MetricsOverview activeFilter={activeFilter} />
      <VacancyChart activeFilter={activeFilter} />
      <IntegrationsStatus />
    </div>
  );
}
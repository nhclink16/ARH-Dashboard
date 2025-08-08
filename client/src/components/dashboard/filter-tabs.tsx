import { PropertyType } from "@/lib/types";

interface FilterTabsProps {
  activeFilter: PropertyType;
  onFilterChange: (filter: PropertyType) => void;
}

export default function FilterTabs({ activeFilter, onFilterChange }: FilterTabsProps) {
  const tabs = [
    { id: 'total' as PropertyType, label: 'All Properties' },
    { id: 'sfr' as PropertyType, label: 'Single Family (SFR)' },
    { id: 'mf' as PropertyType, label: 'Multi-Family (MF)' },
  ];

  return (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-8">
        <nav className="flex space-x-4 sm:space-x-8 overflow-x-auto" aria-label="Property Type Filter">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => onFilterChange(tab.id)}
              className={`filter-tab py-3 sm:py-4 px-2 sm:px-1 text-xs sm:text-sm font-medium border-b-2 whitespace-nowrap flex-shrink-0 ${
                activeFilter === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

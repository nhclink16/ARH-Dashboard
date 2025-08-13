import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Calendar, TrendingUp, CalendarDays } from "lucide-react";

export type PeriodType = 'YTD' | 'Month' | 'YoY';

interface PeriodSelectorProps {
  value: PeriodType;
  onChange: (value: PeriodType) => void;
}

export default function PeriodSelector({ value, onChange }: PeriodSelectorProps) {
  return (
    <ToggleGroup type="single" value={value} onValueChange={(v) => v && onChange(v as PeriodType)} className="bg-white border rounded-lg">
      <ToggleGroupItem value="YTD" aria-label="Year to Date" className="px-3">
        <Calendar className="h-4 w-4 mr-1" />
        YTD
      </ToggleGroupItem>
      <ToggleGroupItem value="Month" aria-label="Month over Month" className="px-3">
        <CalendarDays className="h-4 w-4 mr-1" />
        Month
      </ToggleGroupItem>
      <ToggleGroupItem value="YoY" aria-label="Year over Year" className="px-3">
        <TrendingUp className="h-4 w-4 mr-1" />
        YoY
      </ToggleGroupItem>
    </ToggleGroup>
  );
}
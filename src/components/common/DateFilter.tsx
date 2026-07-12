
import { useState, useEffect } from "react";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { DateFilterOptions } from "./date-filter/DateFilterOptions";
import { CalendarPopover } from "./date-filter/CalendarPopover";
import { formatDateRangeDisplay, getDateRangeFromOption } from "./date-filter/utils";
import { DateFilterProps, DateFilterOption, DateRange } from "./date-filter/types";

export type { DateFilterOption, DateRange } from "./date-filter/types";

export function DateFilter({ onFilterChange }: DateFilterProps) {
  // Use the shared date filter
  const { dateRange: sharedDateRange, selectedOption: sharedOption, updateSharedDateFilter } = useSharedDateFilter();
  
  // Local state for UI
  const [date, setDate] = useState<DateRange>(sharedDateRange);
  const [selectedOption, setSelectedOption] = useState<DateFilterOption>(sharedOption);
  const [open, setOpen] = useState(false);

  // Initialize from shared state
  useEffect(() => {
    setDate(sharedDateRange);
    setSelectedOption(sharedOption);
  }, [sharedDateRange, sharedOption]);

  // Notify both parent component and shared state when date range changes
  useEffect(() => {
    // Notify parent component
    onFilterChange(date, selectedOption);
    
    // Update shared state
    updateSharedDateFilter(date, selectedOption);
  }, [date, selectedOption, onFilterChange, updateSharedDateFilter]);

  const handleOptionSelect = (option: DateFilterOption) => {
    setSelectedOption(option);
    
    if (option === "custom") {
      setOpen(true);
    } else {
      setDate(getDateRangeFromOption(option));
    }
  };

  // Format the date range for display
  const formatDateRange = () => formatDateRangeDisplay(selectedOption, date);

  return (
    <div className="inline-flex items-center gap-1 rounded-full border border-border bg-card p-1">
      <DateFilterOptions selectedOption={selectedOption} handleOptionSelect={handleOptionSelect} />
      <CalendarPopover
        open={open}
        setOpen={setOpen}
        date={date}
        setDate={setDate}
        selectedOption={selectedOption}
        setSelectedOption={setSelectedOption}
        formatDateRange={formatDateRange}
      />
    </div>
  );
}

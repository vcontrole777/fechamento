
import { useState } from "react";
import { DateRange } from "@/types/payment.types";
import { startOfDay, endOfDay, format } from "date-fns";
import { useClosingQueries } from "./closing/useClosingQueries";
import { useClosingCalculations } from "./closing/useClosingCalculations";
import { Payment } from "@/types/payment.types";

export type { TripeiroSummary, AttendantSummary, ClosingSummary } from "./closing/useClosingCalculations";

export function useClosingData() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(today),
    to: endOfDay(today)
  });

  // Fetch data using our custom queries hook
  const { payments, expenses, isLoading } = useClosingQueries(dateRange);
  
  // Get calculation utilities
  const {
    calculateClosingSummary,
    calculateTripeiroSummaries,
    calculateAttendantSummaries
  } = useClosingCalculations();
  
  // Calculate all the summary data
  const closingSummary = calculateClosingSummary(payments, expenses);
  const tripeiroSummaries = calculateTripeiroSummaries(payments);
  const attendantSummaries = calculateAttendantSummaries(payments);

  const updateDateRange = (range: DateRange) => {
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
    console.log("Updating closing date range:", {
      from: newRange.from ? format(newRange.from, 'yyyy-MM-dd') : null,
      to: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : null
    });
    
    setDateRange(newRange);
  };

  return {
    isLoading,
    closingSummary,
    tripeiroSummaries,
    attendantSummaries,
    dateRange,
    updateDateRange,
  };
}

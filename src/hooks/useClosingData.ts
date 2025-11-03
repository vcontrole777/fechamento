import { useState, useEffect } from "react";
import { startOfDay, endOfDay, format } from "date-fns";
import { useClosingQueries } from "./closing/useClosingQueries";
import { useClosingCalculations } from "./closing/useClosingCalculations";
import { useSharedDateFilter } from "./useSharedDateFilter";
import { useAttendantsAndTripeiros } from "@/components/payments/hooks/useAttendantsAndTripeiros";
import { Expense } from "./expenses/useExpensesQuery";
import { DateRange } from "@/components/common/date-filter/types";

export type { TripeiroSummary, AttendantSummary, ClosingSummary } from "./closing/useClosingCalculations";

export function useClosingData() {
  // Use shared date filter instead of local state
  const { dateRange: sharedDateRange, updateSharedDateFilter } = useSharedDateFilter();
  const [dateRange, setDateRange] = useState<DateRange>(sharedDateRange);

  // Keep local state in sync with shared state
  useEffect(() => {
    setDateRange(sharedDateRange);
  }, [sharedDateRange]);

  // Fetch data using our custom queries hook
  const { payments, expenses, isLoading } = useClosingQueries(dateRange);
  
  // Fetch attendants list for referrer names
  const { attendants, isLoading: isLoadingAttendants } = useAttendantsAndTripeiros();
  
  // Get calculation utilities
  const {
    calculateClosingSummary,
    calculateTripeiroSummaries,
    calculateAttendantSummaries
  } = useClosingCalculations();
  
  // Calculate all the summary data
  const closingSummary = calculateClosingSummary(payments, expenses);
  const tripeiroSummaries = calculateTripeiroSummaries(payments);
  const attendantSummaries = calculateAttendantSummaries(payments, attendants);

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
    isLoading: isLoading || isLoadingAttendants,
    closingSummary,
    tripeiroSummaries,
    attendantSummaries,
    expenses,
    dateRange,
    updateDateRange,
  };
}

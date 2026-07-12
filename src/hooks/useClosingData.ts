import { useState, useEffect, useCallback } from "react";
import { startOfDay, endOfDay } from "date-fns";
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

  const updateDateRange = useCallback((range: DateRange) => {
    setDateRange(prev => {
      const from = range.from ? startOfDay(range.from) : null;
      const to = range.to ? endOfDay(range.to) : null;

      const unchanged =
        (prev.from?.getTime() ?? null) === (from?.getTime() ?? null) &&
        (prev.to?.getTime() ?? null) === (to?.getTime() ?? null);

      if (unchanged) return prev;

      return { from, to };
    });
  }, []);

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

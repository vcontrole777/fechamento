import { useState, useEffect } from "react";
import { DateRange } from "@/components/common/DateFilter";
import { startOfDay, endOfDay, format } from "date-fns";
import { 
  usePaymentsQuery, 
  useExpensesQuery,
  useAttendantsQuery
} from "./useDashboardQueries";
import {
  calculateTopAttendants,
  calculateRevenueByMonth,
  calculateExpensesByMonth,
  calculateFinancialStats
} from "@/utils/dashboardCalculations";
import {
  formatRecentPayments,
  formatRecentExpenses
} from "@/utils/dashboardFormatters";
import { useSharedDateFilter } from "./useSharedDateFilter";

export function useDashboardData() {
  // Use shared date filter instead of local state
  const { dateRange: sharedDateRange, updateSharedDateFilter } = useSharedDateFilter();
  const [dateRange, setDateRange] = useState<DateRange>(sharedDateRange);

  // Keep local state in sync with shared state
  useEffect(() => {
    setDateRange(sharedDateRange);
  }, [sharedDateRange]);

  // Fetch data using the refactored query hooks
  const { data: payments, isLoading: isLoadingPayments } = usePaymentsQuery(dateRange);
  const { data: expenses, isLoading: isLoadingExpenses } = useExpensesQuery(dateRange);
  const { data: attendants, isLoading: isLoadingAttendants } = useAttendantsQuery();

  // Process data using the utility functions
  const topAttendants = calculateTopAttendants(attendants || [], payments || []);
  const revenueByMonth = calculateRevenueByMonth(payments || []);
  const expensesByMonth = calculateExpensesByMonth(expenses || []);
  const recentPayments = formatRecentPayments(payments || []);
  const recentExpenses = formatRecentExpenses(expenses || []);
  const financialStats = calculateFinancialStats(payments || [], expenses || []);

  const updateDateRange = (range: DateRange) => {
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
    console.log("Updating dashboard date range:", {
      from: newRange.from ? format(newRange.from, 'yyyy-MM-dd') : null,
      to: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : null
    });
    
    setDateRange(newRange);
  };

  return {
    isLoading: isLoadingPayments || isLoadingExpenses || isLoadingAttendants,
    topAttendants,
    revenueByMonth,
    expensesByMonth,
    recentPayments,
    recentExpenses,
    financialStats,
    dateRange,
    updateDateRange,
  };
}

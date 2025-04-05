
import { useState } from "react";
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

export function useDashboardData() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(today),
    to: endOfDay(today)
  });

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

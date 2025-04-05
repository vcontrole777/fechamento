
import { useState } from "react";
import { DateRange } from "@/components/common/DateFilter";
import { startOfDay, endOfDay } from "date-fns";
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
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
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
    setDateRange(range);
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

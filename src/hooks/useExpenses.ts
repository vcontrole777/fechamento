import { useState, useEffect } from "react";
import { format, startOfDay, endOfDay } from "date-fns";
import { useExpensesQuery, Expense } from "./expenses/useExpensesQuery";
import { useExpensesDialogState } from "./expenses/useExpensesDialogState";
import { DateRange } from "@/types/payment.types";
import { useSharedDateFilter } from "./useSharedDateFilter";

export function useExpenses() {
  // Use shared date filter instead of local state
  const { dateRange: sharedDateRange, updateSharedDateFilter } = useSharedDateFilter();
  const [dateRange, setDateRange] = useState<DateRange>(sharedDateRange);

  // Keep local state in sync with shared state
  useEffect(() => {
    setDateRange(sharedDateRange);
  }, [sharedDateRange]);

  const { data: expenses, isLoading, refetch } = useExpensesQuery(dateRange);
  const dialogState = useExpensesDialogState();

  // Calculate total expenses
  const totalExpenses = expenses?.reduce((acc, expense) => acc + expense.valor, 0) || 0;

  const updateDateRange = (range: DateRange) => {
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
    console.log("Updating expenses date range:", {
      from: newRange.from ? format(newRange.from, 'yyyy-MM-dd') : null,
      to: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : null
    });
    
    setDateRange(newRange);
  };

  return {
    expenses,
    isLoading,
    totalExpenses,
    dateRange,
    updateDateRange,
    refetch,
    ...dialogState
  };
}

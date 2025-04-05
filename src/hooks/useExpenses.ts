
import { useState } from "react";
import { DateRange } from "@/types/payment.types";
import { startOfDay, endOfDay, format } from "date-fns";
import { useExpensesQuery, type Expense } from "./expenses/useExpensesQuery";
import { useExpensesDialogState } from "./expenses/useExpensesDialogState";

export type { Expense } from "./expenses/useExpensesQuery";

export function useExpenses() {
  // Initialize with current date
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(today),
    to: endOfDay(today)
  });

  // Use the new hooks
  const { data: expenses, isLoading, refetch } = useExpensesQuery(dateRange);
  const dialogState = useExpensesDialogState();

  const totalExpenses = expenses?.reduce((acc, expense) => acc + Number(expense.valor), 0) || 0;

  const updateDateRange = (range: DateRange) => {
    // Make sure we're using startOfDay and endOfDay correctly
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
    console.log("Updating date range in useExpenses:", {
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
    ...dialogState,
  };
}

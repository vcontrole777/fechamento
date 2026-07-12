
import { useState, useEffect, useCallback } from "react";
import { startOfDay, endOfDay } from "date-fns";
import { useExpensesQuery, Expense } from "./expenses/useExpensesQuery";
import { useDialogState } from "./useDialogState";
import { DateRange } from "@/components/common/date-filter/types";
import { useSharedDateFilter } from "./useSharedDateFilter";

// Export the Expense type from useExpensesQuery
export type { Expense } from "./expenses/useExpensesQuery";

export function useExpenses() {
  // Use shared date filter instead of local state
  const { dateRange: sharedDateRange, updateSharedDateFilter } = useSharedDateFilter();
  const [dateRange, setDateRange] = useState<DateRange>(sharedDateRange);

  // Keep local state in sync with shared state
  useEffect(() => {
    setDateRange(sharedDateRange);
  }, [sharedDateRange]);

  const { data: expenses, isLoading, refetch } = useExpensesQuery(dateRange);
  const dialogState = useDialogState<Expense>();

  // Calculate total expenses
  const totalExpenses = expenses?.reduce((acc, expense) => acc + expense.valor, 0) || 0;

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
    expenses,
    isLoading,
    totalExpenses,
    dateRange,
    updateDateRange,
    refetch,
    isAddingExpense: dialogState.isAdding,
    isEditingExpense: dialogState.isEditing,
    isDeletingExpense: dialogState.isDeleting,
    selectedExpense: dialogState.selected,
    openAddExpenseDialog: dialogState.openAdd,
    closeAddExpenseDialog: dialogState.closeAdd,
    openEditExpenseDialog: dialogState.openEdit,
    closeEditExpenseDialog: dialogState.closeEdit,
    openDeleteExpenseDialog: dialogState.openDelete,
    closeDeleteExpenseDialog: dialogState.closeDelete,
  };
}

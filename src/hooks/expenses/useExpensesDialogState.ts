
import { useState } from "react";
import { Expense } from "./useExpensesQuery";

export function useExpensesDialogState() {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  
  const openAddExpenseDialog = () => setIsAddingExpense(true);
  const closeAddExpenseDialog = () => setIsAddingExpense(false);
  
  const openEditExpenseDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditingExpense(true);
  };
  const closeEditExpenseDialog = () => {
    setSelectedExpense(null);
    setIsEditingExpense(false);
  };
  
  const openDeleteExpenseDialog = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsDeletingExpense(true);
  };
  const closeDeleteExpenseDialog = () => {
    setSelectedExpense(null);
    setIsDeletingExpense(false);
  };

  return {
    isAddingExpense,
    isEditingExpense,
    isDeletingExpense,
    selectedExpense,
    openAddExpenseDialog,
    closeAddExpenseDialog,
    openEditExpenseDialog,
    closeEditExpenseDialog,
    openDeleteExpenseDialog,
    closeDeleteExpenseDialog,
  };
}

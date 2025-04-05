
import React from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useExpenses } from "@/hooks/useExpenses";
import EmptyExpensesState from "@/components/expenses/EmptyExpensesState";
import ExpensesTable from "@/components/expenses/ExpensesTable";
import NewExpenseDialog from "@/components/expenses/NewExpenseDialog";
import EditExpenseDialog from "@/components/expenses/EditExpenseDialog";
import DeleteExpenseDialog from "@/components/expenses/DeleteExpenseDialog";
import { DateFilter, DateFilterOption } from "@/components/common/DateFilter";

export default function Expenses() {
  const {
    expenses,
    isLoading,
    totalExpenses,
    dateRange,
    updateDateRange,
    refetch,
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
  } = useExpenses();

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleDateFilterChange = (newDateRange, option: DateFilterOption) => {
    updateDateRange(newDateRange);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Despesas</h1>
        <Button onClick={openAddExpenseDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <div className="flex justify-between items-center">
        <DateFilter onFilterChange={handleDateFilterChange} />
        <div className="grid gap-6 md:grid-cols-1">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Despesas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(totalExpenses)}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Todas as Despesas</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : expenses && expenses.length > 0 ? (
            <ExpensesTable
              expenses={expenses}
              onEdit={openEditExpenseDialog}
              onDelete={openDeleteExpenseDialog}
              formatCurrency={formatCurrency}
            />
          ) : (
            <EmptyExpensesState />
          )}
        </CardContent>
      </Card>

      <NewExpenseDialog
        open={isAddingExpense}
        onOpenChange={closeAddExpenseDialog}
        onSuccess={refetch}
      />

      <EditExpenseDialog
        expense={selectedExpense}
        open={isEditingExpense}
        onOpenChange={closeEditExpenseDialog}
        onSuccess={refetch}
      />

      <DeleteExpenseDialog
        expense={selectedExpense}
        open={isDeletingExpense}
        onOpenChange={closeDeleteExpenseDialog}
        onSuccess={refetch}
      />
    </div>
  );
}

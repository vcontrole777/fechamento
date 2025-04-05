
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
import { format } from "date-fns";

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
    console.log("Date filter changed on Expenses page:", {
      from: newDateRange.from ? format(newDateRange.from, 'yyyy-MM-dd') : null,
      to: newDateRange.to ? format(newDateRange.to, 'yyyy-MM-dd') : null,
      option
    });
    updateDateRange(newDateRange);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Despesas</h1>
        <Button onClick={openAddExpenseDialog}>
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start gap-4">
          <DateFilter onFilterChange={handleDateFilterChange} />
        </div>
        
        <div className="w-full flex justify-center">
          <div className="grid gap-4 grid-cols-1 max-w-md">
            <Card className="w-full">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">
                  Total de Despesas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(totalExpenses)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Soma de todas as despesas no período
                </p>
              </CardContent>
            </Card>
          </div>
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

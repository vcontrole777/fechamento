import React, { useEffect, useState, useMemo } from "react";
import { Plus, DollarSign, TrendingDown, Calendar, BarChart3 } from "lucide-react";
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
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { StatsCard } from "@/components/common/StatsCard";
import { SearchBar } from "@/components/common/SearchBar";
import { ExpenseFilters } from "@/components/expenses/ExpenseFilters";
import { useResponsaveis } from "@/components/expenses/hooks/useResponsaveis";
import { useExpenseStats } from "@/hooks/expenses/useExpenseStats";

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

  const { data: responsaveis = [] } = useResponsaveis();
  const { data: stats } = useExpenseStats(dateRange);
  const { updateSharedDateFilter } = useSharedDateFilter();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedResponsaveis, setSelectedResponsaveis] = useState<number[]>([]);

  // Force refetch when component mounts
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (value: number) => {
    return value.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleDateFilterChange = (newDateRange, option: DateFilterOption) => {
    updateDateRange(newDateRange);
    updateSharedDateFilter(newDateRange, option);
  };

  const filteredExpenses = useMemo(() => {
    if (!expenses) return [];
    
    return expenses.filter(expense => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        if (!expense.descricao.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Category filter
      if (selectedCategories.length > 0) {
        if (!expense.categoria || !selectedCategories.includes(expense.categoria)) {
          return false;
        }
      }

      // Responsavel filter
      if (selectedResponsaveis.length > 0) {
        if (!expense.id_responsavel || !selectedResponsaveis.includes(expense.id_responsavel)) {
          return false;
        }
      }

      return true;
    });
  }, [expenses, searchQuery, selectedCategories, selectedResponsaveis]);

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">Despesas</h1>
          <p className="text-muted-foreground">Gerencie todas as despesas da equipe</p>
        </div>
        <Button onClick={openAddExpenseDialog} className="glow-border">
          <Plus className="h-4 w-4 mr-2" />
          Nova Despesa
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total de Despesas"
          value={formatCurrency(stats?.totalExpenses || 0)}
          icon={DollarSign}
          description="No período selecionado"
        />
        <StatsCard
          title="Despesas do Mês"
          value={formatCurrency(stats?.totalMonthExpenses || 0)}
          icon={Calendar}
          description="Mês atual"
        />
        <StatsCard
          title="Quantidade"
          value={stats?.expenseCount || 0}
          icon={BarChart3}
          description={`${filteredExpenses.length} após filtros`}
        />
        <StatsCard
          title="Maior Despesa"
          value={formatCurrency(stats?.highestExpense || 0)}
          icon={TrendingDown}
          description="Valor máximo registrado"
        />
      </div>

      {/* Main Card */}
      <Card className="glow-card border-2 border-primary">
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Todas as Despesas</CardTitle>
            <div className="flex flex-col sm:flex-row gap-3">
              <DateFilter onFilterChange={handleDateFilterChange} />
              <SearchBar 
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Buscar por descrição..."
              />
              <ExpenseFilters
                selectedCategories={selectedCategories}
                onCategoriesChange={setSelectedCategories}
                selectedResponsaveis={selectedResponsaveis}
                onResponsaveisChange={setSelectedResponsaveis}
                responsaveis={responsaveis}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            </div>
          ) : filteredExpenses.length > 0 ? (
            <ExpensesTable
              expenses={filteredExpenses}
              onEdit={openEditExpenseDialog}
              onDelete={openDeleteExpenseDialog}
              formatCurrency={formatCurrency}
            />
          ) : searchQuery || selectedCategories.length > 0 || selectedResponsaveis.length > 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma despesa encontrada com os filtros aplicados
            </div>
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


import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "@/components/common/DateFilter";
import { format, startOfDay, endOfDay } from "date-fns";

export type Expense = {
  id: number;
  valor: number;
  descricao: string;
  data: string;
  criado_em: string;
  id_equipe: number;
  id_responsavel: number | null;
  responsavel?: {
    nome: string;
  };
};

export function useExpenses() {
  const [isAddingExpense, setIsAddingExpense] = useState(false);
  const [isEditingExpense, setIsEditingExpense] = useState(false);
  const [isDeletingExpense, setIsDeletingExpense] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });

  const { data: expenses, isLoading, refetch } = useQuery({
    queryKey: ["expenses", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("despesas")
        .select(`
          *,
          responsavel:pessoas(nome)
        `);
      
      // Apply date range filter
      if (dateRange.from) {
        query = query.gte('data', format(dateRange.from, 'yyyy-MM-dd'));
      }
      
      if (dateRange.to) {
        query = query.lte('data', format(dateRange.to, 'yyyy-MM-dd'));
      }
      
      query = query.order("data", { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Erro ao carregar despesas",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Expense[];
    },
  });

  const totalExpenses = expenses?.reduce((acc, expense) => acc + Number(expense.valor), 0) || 0;

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

  const updateDateRange = (range: DateRange) => {
    setDateRange(range);
  };

  return {
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
  };
}

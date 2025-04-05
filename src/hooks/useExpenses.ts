
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
  
  // Initialize with current date
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(today),
    to: endOfDay(today)
  });

  const { data: expenses, isLoading, refetch } = useQuery({
    queryKey: ["expenses", dateRange],
    queryFn: async () => {
      // Format dates for database query (YYYY-MM-DD)
      const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;
      
      console.log("Fetching expenses with date range:", {
        from: fromDate,
        to: toDate
      });
      
      let query = supabase
        .from("despesas")
        .select(`
          *,
          responsavel:pessoas(nome)
        `);
      
      // Apply date filter with exact dates
      if (fromDate) {
        console.log("Filtering expenses from date:", fromDate);
        query = query.gte('data', fromDate);
      }
      
      if (toDate) {
        console.log("Filtering expenses to date:", toDate);
        query = query.lte('data', toDate);
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

      console.log("Received expense data:", data);
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
    // Apply the date range directly using startOfDay and endOfDay
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
    console.log("Updating date range:", {
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

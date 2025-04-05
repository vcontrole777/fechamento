
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "@/components/common/DateFilter";
import { format, startOfDay, endOfDay } from "date-fns";
import { toZonedTime } from "date-fns-tz";

// Brazil São Paulo timezone
const TIMEZONE = "America/Sao_Paulo";

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
  
  // Initialize with today's date in Brazil timezone
  const today = toZonedTime(new Date(), TIMEZONE);
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(today),
    to: endOfDay(today)
  });

  const { data: expenses, isLoading, refetch } = useQuery({
    queryKey: ["expenses", dateRange],
    queryFn: async () => {
      console.log("Fetching expenses with date range:", {
        from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
        to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null,
        timezone: TIMEZONE
      });
      
      let query = supabase
        .from("despesas")
        .select(`
          *,
          responsavel:pessoas(nome)
        `);
      
      // Apply date range filter with proper date boundaries
      if (dateRange.from) {
        // Format date to YYYY-MM-DD for SQL comparison
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        console.log("Filtering from date:", fromDate);
        query = query.gte('data', fromDate);
      }
      
      if (dateRange.to) {
        // Format date to YYYY-MM-DD for SQL comparison
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        console.log("Filtering to date:", toDate);
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
    console.log("Updating date range:", {
      from: range.from ? format(range.from, 'yyyy-MM-dd') : null,
      to: range.to ? format(range.to, 'yyyy-MM-dd') : null,
      timezone: TIMEZONE
    });
    
    // Ensure we have proper start/end of day boundaries in São Paulo timezone
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
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

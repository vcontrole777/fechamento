import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format, subMonths, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateRange } from "@/components/common/DateFilter";

export function useDashboardData() {
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });

  // Fetch all payments
  const { data: payments, isLoading: isLoadingPayments } = useQuery({
    queryKey: ["dashboard-payments", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("pagamentos")
        .select(`
          *,
          atendente:pessoas!pagamentos_id_atendente_fkey(nome, porcentagem),
          tripeiro:pessoas!pagamentos_id_tripeiro_fkey(nome, porcentagem)
        `)
        .order("data", { ascending: false });

      // Apply date range filter
      if (dateRange.from) {
        query = query.gte('data', format(dateRange.from, 'yyyy-MM-dd'));
      }
      
      if (dateRange.to) {
        query = query.lte('data', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Erro ao carregar pagamentos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  // Fetch all expenses
  const { data: expenses, isLoading: isLoadingExpenses } = useQuery({
    queryKey: ["dashboard-expenses", dateRange],
    queryFn: async () => {
      let query = supabase
        .from("despesas")
        .select(`
          *,
          responsavel:pessoas(nome)
        `)
        .order("data", { ascending: false });

      // Apply date range filter
      if (dateRange.from) {
        query = query.gte('data', format(dateRange.from, 'yyyy-MM-dd'));
      }
      
      if (dateRange.to) {
        query = query.lte('data', format(dateRange.to, 'yyyy-MM-dd'));
      }

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Erro ao carregar despesas",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  // Fetch attendants performance
  const { data: attendants, isLoading: isLoadingAttendants } = useQuery({
    queryKey: ["dashboard-attendants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("pessoas")
        .select("id, nome")
        .eq("tipo", "atendente")
        .order("nome");

      if (error) {
        toast({
          title: "Erro ao carregar atendentes",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data;
    },
  });

  // Calculate top attendants based on payments
  const topAttendants = calculateTopAttendants(attendants || [], payments || []);

  // Calculate revenue by month
  const revenueByMonth = calculateRevenueByMonth(payments || []);

  // Calculate expenses by month
  const expensesByMonth = calculateExpensesByMonth(expenses || []);

  // Get recent payments
  const recentPayments = formatRecentPayments(payments || []);

  // Get recent expenses
  const recentExpenses = formatRecentExpenses(expenses || []);

  // Calculate financial numbers
  const financialStats = calculateFinancialStats(payments || [], expenses || []);

  const updateDateRange = (range: DateRange) => {
    setDateRange(range);
  };

  return {
    isLoading: isLoadingPayments || isLoadingExpenses || isLoadingAttendants,
    topAttendants,
    revenueByMonth,
    expensesByMonth,
    recentPayments,
    recentExpenses,
    financialStats,
    dateRange,
    updateDateRange,
  };
}

function calculateTopAttendants(attendants, payments) {
  // Identify completed payments for attendants
  const completedPayments = payments.filter(payment => payment.status === "concluido");
  
  // Calculate sales totals for each attendant
  const attendantSales = attendants.map(attendant => {
    const attendantPayments = completedPayments.filter(
      payment => payment.id_atendente === attendant.id
    );
    
    const totalSales = attendantPayments.reduce(
      (sum, payment) => sum + Number(payment.valor), 
      0
    );
    
    return {
      id: attendant.id.toString(),
      name: attendant.nome,
      sales: totalSales
    };
  });
  
  // Sort by sales (highest first) and take top 4
  const sortedAttendants = attendantSales
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);
    
  // Calculate progress percentages based on highest sales
  const highestSales = sortedAttendants.length > 0 ? sortedAttendants[0].sales : 1;
  
  return sortedAttendants.map(attendant => ({
    ...attendant,
    progress: Math.round((attendant.sales / highestSales) * 100)
  }));
}

function calculateRevenueByMonth(payments) {
  // Get only completed payments
  const completedPayments = payments.filter(payment => payment.status === "concluido");
  
  // Create an object to store revenue by month
  const revenueMap = {};
  
  // Get the last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthKey = format(date, "MMM", { locale: ptBR });
    months.push(monthKey);
    revenueMap[monthKey] = 0;
  }
  
  // Sum the revenue for each month
  completedPayments.forEach(payment => {
    const date = new Date(payment.data);
    const monthKey = format(date, "MMM", { locale: ptBR });
    
    // Only include the last 6 months
    if (months.includes(monthKey)) {
      revenueMap[monthKey] += Number(payment.valor);
    }
  });
  
  // Convert to array for charts
  return months.map(month => ({
    name: month.charAt(0).toUpperCase() + month.slice(1),
    valor: revenueMap[month]
  }));
}

function calculateExpensesByMonth(expenses) {
  // Create an object to store expenses by month
  const expenseMap = {};
  
  // Get the last 6 months
  const months = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthKey = format(date, "MMM", { locale: ptBR });
    months.push(monthKey);
    expenseMap[monthKey] = 0;
  }
  
  // Sum the expenses for each month
  expenses.forEach(expense => {
    const date = new Date(expense.data);
    const monthKey = format(date, "MMM", { locale: ptBR });
    
    // Only include the last 6 months
    if (months.includes(monthKey)) {
      expenseMap[monthKey] += Number(expense.valor);
    }
  });
  
  // Convert to array for charts
  return months.map(month => ({
    name: month.charAt(0).toUpperCase() + month.slice(1),
    valor: expenseMap[month]
  }));
}

function formatRecentPayments(payments) {
  // Take the most recent 4 payments
  return payments.slice(0, 4).map(payment => ({
    id: payment.id.toString(),
    name: payment.atendente?.nome || "Não atribuído",
    type: payment.tipo === "pix" ? "PIX" : "Boleto",
    amount: payment.valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }),
    status: payment.status === "concluido" ? "completed" : 
            payment.status === "pendente" ? "pending" : "failed",
    date: format(new Date(payment.data), "dd/MM/yyyy", { locale: ptBR })
  }));
}

function formatRecentExpenses(expenses) {
  // Take the most recent 4 expenses
  return expenses.slice(0, 4).map(expense => ({
    id: expense.id.toString(),
    name: expense.responsavel?.nome || expense.descricao,
    type: "Despesa",
    amount: expense.valor.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }),
    status: "completed",
    date: format(new Date(expense.data), "dd/MM/yyyy", { locale: ptBR })
  }));
}

function calculateFinancialStats(payments, expenses) {
  // Only consider completed payments
  const completedPayments = payments.filter(payment => payment.status === "concluido");
  
  // Calculate total revenue
  const totalRevenue = completedPayments.reduce(
    (sum, payment) => sum + Number(payment.valor), 
    0
  );
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.valor), 
    0
  );
  
  // Calculate net profit
  const netProfit = totalRevenue - totalExpenses;
  
  // Calculate trends (comparing with previous period)
  // For simplicity, we'll use a fixed trend value
  // In a real application, you would compare with previous months
  const revenueTrend = 12;
  const expensesTrend = -5;
  const profitTrend = 18;
  
  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    revenueTrend,
    expensesTrend,
    profitTrend,
  };
}

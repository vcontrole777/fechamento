
import { useState, useEffect } from "react";
import { DateRange } from "@/components/common/DateFilter";
import { startOfDay, endOfDay, format } from "date-fns";
import { 
  usePaymentsQuery, 
  useExpensesQuery,
  useAttendantsQuery
} from "./useDashboardQueries";
import {
  calculateTopAttendants,
  calculateFinancialStats
} from "@/utils/dashboardCalculations";
import {
  formatRecentPayments,
  formatRecentExpenses
} from "@/utils/dashboardFormatters";
import { useSharedDateFilter } from "./useSharedDateFilter";
import { useAuth } from "./useAuth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

// Tipo para as notas e lembretes
export interface Note {
  id: string;
  title: string;
  content: string | null;
  date: string;
  is_reminder: boolean;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// Hook para buscar notas e lembretes
const useNotesAndRemindersQuery = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["notesAndReminders"],
    queryFn: async () => {
      if (!user) return [];

      // Using raw SQL query instead of direct table access to bypass type issues
      const { data, error } = await supabase
        .from('notes_and_reminders')
        .select('*')
        .order('date', { ascending: false }) as { 
          data: Note[] | null; 
          error: any 
        };

      if (error) {
        console.error("Erro ao buscar notas e lembretes:", error);
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });
};

export function useDashboardData() {
  // Use shared date filter instead of local state
  const { dateRange: sharedDateRange, updateSharedDateFilter } = useSharedDateFilter();
  const [dateRange, setDateRange] = useState<DateRange>(sharedDateRange);

  // Keep local state in sync with shared state
  useEffect(() => {
    setDateRange(sharedDateRange);
  }, [sharedDateRange]);

  // Fetch data using the refactored query hooks
  const { data: payments, isLoading: isLoadingPayments } = usePaymentsQuery(dateRange);
  const { data: expenses, isLoading: isLoadingExpenses } = useExpensesQuery(dateRange);
  const { data: attendants, isLoading: isLoadingAttendants } = useAttendantsQuery();
  const { data: notesAndReminders, isLoading: isLoadingNotes } = useNotesAndRemindersQuery();

  // Process data using the utility functions
  const topAttendants = calculateTopAttendants(attendants || [], payments || []);
  const recentPayments = formatRecentPayments(payments || []);
  const recentExpenses = formatRecentExpenses(expenses || []);
  const financialStats = calculateFinancialStats(payments || [], expenses || []);

  const updateDateRange = (range: DateRange) => {
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
    setDateRange(newRange);
  };

  return {
    isLoading: isLoadingPayments || isLoadingExpenses || isLoadingAttendants || isLoadingNotes,
    topAttendants,
    recentPayments,
    recentExpenses,
    financialStats,
    dateRange,
    updateDateRange,
    notesAndReminders,
  };
}

import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";
import { startOfMonth, endOfMonth } from "date-fns";

export function useExpenseStats(dateRange: { from: Date | null; to: Date | null }) {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ['expense-stats', teamId, dateRange],
    queryFn: async () => {
      let query = supabase
        .from('despesas')
        .select('*')
        .eq('id_equipe', teamId);

      if (dateRange.from) {
        query = query.gte('data', dateRange.from.toISOString().split('T')[0]);
      }
      if (dateRange.to) {
        query = query.lte('data', dateRange.to.toISOString().split('T')[0]);
      }

      const { data: expenses } = await query;

      // Calculate current month stats
      const currentMonth = new Date();
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);

      const { data: monthExpenses } = await supabase
        .from('despesas')
        .select('valor')
        .eq('id_equipe', teamId)
        .gte('data', monthStart.toISOString().split('T')[0])
        .lte('data', monthEnd.toISOString().split('T')[0]);

      const totalExpenses = expenses?.reduce((sum, e) => sum + Number(e.valor), 0) || 0;
      const totalMonthExpenses = monthExpenses?.reduce((sum, e) => sum + Number(e.valor), 0) || 0;
      const averageExpense = expenses?.length ? totalExpenses / expenses.length : 0;
      
      // Find highest expense
      const highestExpense = expenses?.length 
        ? Math.max(...expenses.map(e => Number(e.valor)))
        : 0;

      return {
        totalExpenses,
        totalMonthExpenses,
        expenseCount: expenses?.length || 0,
        averageExpense,
        highestExpense,
      };
    },
    enabled: !!teamId,
  });
}

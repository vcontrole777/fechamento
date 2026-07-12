
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "@/types/payment.types";
import { format } from "date-fns";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";

// Fetch payments data with date range filtering
export function usePaymentsQuery(dateRange: DateRange) {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ["dashboard-payments", dateRange, teamId],
    queryFn: async () => {
      // Format dates properly for database query (YYYY-MM-DD)
      const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

      let query = supabase
        .from("pagamentos")
        .select(`
          *,
          atendente:pessoas!pagamentos_id_atendente_fkey(nome, porcentagem),
          tripeiro:pessoas!pagamentos_id_tripeiro_fkey(nome, porcentagem)
        `)
        .order("data", { ascending: false });

      // Filter by team
      if (teamId) {
        query = query.eq("id_equipe", teamId);
      }

      // Apply date range filter with exact date matching
      if (fromDate) {
        query = query.gte('data', fromDate);
      }
      
      if (toDate) {
        query = query.lte('data', toDate);
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
    enabled: !!teamId,
  });
}

// Fetch expenses data with date range filtering
export function useExpensesQuery(dateRange: DateRange) {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ["dashboard-expenses", dateRange, teamId],
    queryFn: async () => {
      // Format dates properly for database query (YYYY-MM-DD)
      const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

      let query = supabase
        .from("despesas")
        .select(`
          *,
          responsavel:pessoas(nome)
        `)
        .order("data", { ascending: false });

      // Filter by team
      if (teamId) {
        query = query.eq("id_equipe", teamId);
      }

      // Apply date filter with exact date matching
      if (fromDate) {
        console.log("Filtering expenses from date:", fromDate);
        query = query.gte('data', fromDate);
      }
      
      if (toDate) {
        console.log("Filtering expenses to date:", toDate);
        query = query.lte('data', toDate);
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
    enabled: !!teamId,
  });
}

// Fetch attendants data
export function useAttendantsQuery() {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ["dashboard-attendants", teamId],
    queryFn: async () => {
      let query = supabase
        .from("pessoas")
        .select("id, nome")
        .eq("tipo", "atendente");

      // Filter by team
      if (teamId) {
        query = query.eq("id_equipe", teamId);
      }

      query = query.order("nome");

      const { data, error } = await query;

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
    enabled: !!teamId,
  });
}


import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Payment, PaymentFilters } from "@/types/payment.types";
import { DateRange } from "@/components/common/date-filter/types";
import { format } from "date-fns";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";

export function usePaymentsQuery(filters: PaymentFilters, dateRange: DateRange) {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ["payments", filters, dateRange, teamId],
    queryFn: async () => {
      // Format dates properly for database query (YYYY-MM-DD)
      const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

      let query = supabase
        .from("pagamentos")
        .select(`
          *,
          atendente:pessoas!pagamentos_id_atendente_fkey(id, nome, porcentagem),
          tripeiro:pessoas!pagamentos_id_tripeiro_fkey(id, nome, porcentagem)
        `);

      // Filter by team
      if (teamId) {
        query = query.eq("id_equipe", teamId);
      }

      // Apply filters
      if (filters.attendantIds.length > 0) {
        query = query.in("id_atendente", filters.attendantIds);
      }
      
      if (filters.tripeiroIds.length > 0) {
        query = query.in("id_tripeiro", filters.tripeiroIds);
      }
      
      if (filters.statuses.length > 0) {
        query = query.in("status", filters.statuses);
      }
      
      // Fix the date range filter logic for exact matching
      if (fromDate && toDate && fromDate === toDate) {
        // If same day, use eq for exact date match
        console.log("Filtering payments for exact date:", fromDate);
        query = query.eq('data', fromDate);
      } else {
        // Apply date range filter with inclusive boundaries
        if (fromDate) {
          console.log("Filtering payments from date:", fromDate);
          query = query.gte('data', fromDate);
        }
        
        if (toDate) {
          console.log("Filtering payments to date:", toDate);
          query = query.lte('data', toDate);
        }
      }

      query = query.order("data", { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Erro ao carregar pagamentos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      console.log("Payments retrieved from database:", data);

      return data as Payment[];
    },
    enabled: !!teamId,
  });
}

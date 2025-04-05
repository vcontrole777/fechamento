
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "@/components/common/DateFilter";
import { format } from "date-fns";

// Brazil São Paulo timezone
const TIMEZONE = "America/Sao_Paulo";

// Fetch payments data with date range filtering
export function usePaymentsQuery(dateRange: DateRange) {
  return useQuery({
    queryKey: ["dashboard-payments", dateRange],
    queryFn: async () => {
      console.log("Fetching dashboard payments with date range:", {
        from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
        to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null
      });
      
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
        // Format date to YYYY-MM-DD for SQL comparison
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        query = query.gte('data', fromDate);
      }
      
      if (dateRange.to) {
        // Format date to YYYY-MM-DD for SQL comparison
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
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
  });
}

// Fetch expenses data with date range filtering
export function useExpensesQuery(dateRange: DateRange) {
  return useQuery({
    queryKey: ["dashboard-expenses", dateRange],
    queryFn: async () => {
      console.log("Fetching dashboard expenses with date range:", {
        from: dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null,
        to: dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null
      });
      
      let query = supabase
        .from("despesas")
        .select(`
          *,
          responsavel:pessoas(nome)
        `)
        .order("data", { ascending: false });

      // Apply date range filter
      if (dateRange.from) {
        // Format date to YYYY-MM-DD for SQL comparison
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        query = query.gte('data', fromDate);
      }
      
      if (dateRange.to) {
        // Format date to YYYY-MM-DD for SQL comparison
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
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
  });
}

// Fetch attendants data
export function useAttendantsQuery() {
  return useQuery({
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
}

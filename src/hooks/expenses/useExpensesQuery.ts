
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "@/components/common/date-filter/types";
import { format } from "date-fns";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";

export type Expense = {
  id: number;
  valor: number;
  descricao: string;
  data: string;
  criado_em: string;
  id_equipe: number;
  id_responsavel: number | null;
  categoria: string | null;
  responsavel?: {
    nome: string;
  };
};

export function useExpensesQuery(dateRange: DateRange) {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ["expenses", dateRange, teamId],
    queryFn: async () => {
      // Format dates for database query (YYYY-MM-DD)
      const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

      let query = supabase
        .from("despesas")
        .select(`
          *,
          responsavel:pessoas(nome)
        `);

      // Filter by team
      if (teamId) {
        query = query.eq("id_equipe", teamId);
      }
      
      // Apply date filter with exact date matching for same day
      if (fromDate && toDate && fromDate === toDate) {
        // If same day, use eq for exact date match
        console.log("Filtering expenses for exact date:", fromDate);
        query = query.eq('data', fromDate);
      } else {
        // Apply date range filter with inclusive boundaries
        if (fromDate) {
          console.log("Filtering expenses from date:", fromDate);
          query = query.gte('data', fromDate);
        }
        
        if (toDate) {
          console.log("Filtering expenses to date:", toDate);
          query = query.lte('data', toDate);
        }
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
    enabled: !!teamId,
  });
}

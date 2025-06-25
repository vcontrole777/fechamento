
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Recebimento } from "@/types/recebimento.types";
import { DateRange } from "@/types/payment.types";

export function useRecebimentosQuery(dateRange?: DateRange) {
  return useQuery({
    queryKey: ["recebimentos", dateRange],
    queryFn: async (): Promise<Recebimento[]> => {
      console.log("Fetching recebimentos with date range:", dateRange);
      
      let query = supabase
        .from("recebimentos")
        .select(`
          *,
          tripeiro:pessoas!recebimentos_id_tripeiro_fkey (
            id,
            nome,
            porcentagem
          )
        `)
        .order("data", { ascending: false });

      if (dateRange?.from) {
        query = query.gte("data", dateRange.from.toISOString().split("T")[0]);
      }
      
      if (dateRange?.to) {
        query = query.lte("data", dateRange.to.toISOString().split("T")[0]);
      }

      const { data, error } = await query;

      if (error) {
        console.error("Error fetching recebimentos:", error);
        throw error;
      }

      console.log("Fetched recebimentos:", data);
      
      // Converter os dados para o tipo Recebimento correto
      return (data || []).map(item => ({
        ...item,
        tipo_deposito: item.tipo_deposito as "deposito" | "pix" | "especie"
      }));
    }
  });
}

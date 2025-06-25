
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { ContaBancaria } from "@/types/conta-bancaria.types";

export function useContasBancariasQuery() {
  return useQuery({
    queryKey: ["contas-bancarias"],
    queryFn: async (): Promise<ContaBancaria[]> => {
      console.log("Fetching contas bancárias");
      
      const { data, error } = await supabase
        .from("contas_bancarias")
        .select("*")
        .order("nome", { ascending: true });

      if (error) {
        console.error("Error fetching contas bancárias:", error);
        throw error;
      }

      console.log("Fetched contas bancárias:", data);
      return data || [];
    }
  });
}

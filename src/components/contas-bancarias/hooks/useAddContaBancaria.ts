
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { NewContaBancaria } from "@/types/conta-bancaria.types";

export function useAddContaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: NewContaBancaria) => {
      console.log("Adding conta bancária:", data);
      
      const { data: result, error } = await supabase
        .from("contas_bancarias")
        .insert([{
          ...data,
          id_equipe: 1 // TODO: Get from user context
        }])
        .select()
        .single();

      if (error) {
        console.error("Error adding conta bancária:", error);
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast.success("Conta bancária cadastrada com sucesso!");
    },
    onError: (error: any) => {
      console.error("Error adding conta bancária:", error);
      toast.error("Erro ao cadastrar conta bancária");
    }
  });
}

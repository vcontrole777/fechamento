
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export type ContaBancaria = {
  id: number;
  nome: string;
  banco: string;
  agencia: string;
  conta: string;
  titular: string | null;
  criado_em: string;
  atualizado_em: string;
  id_equipe: number;
};

export function useContasBancarias() {
  return useQuery({
    queryKey: ["contas-bancarias"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contas_bancarias")
        .select("*")
        .order("nome");

      if (error) {
        toast({
          title: "Erro ao carregar contas bancárias",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as ContaBancaria[];
    },
  });
}

export function useAddContaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      banco: string;
      agencia: string;
      conta: string;
      titular: string;
    }) => {
      // Generate a default name based on bank and account info
      const nome = `${data.banco} - ${data.agencia}/${data.conta}`;
      
      const { data: result, error } = await supabase
        .from("contas_bancarias")
        .insert([{
          ...data,
          nome,
          id_equipe: 1 // TODO: Get from user context
        }])
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast({
        title: "Conta bancária adicionada",
        description: "A conta foi cadastrada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar conta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useUpdateContaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      id: number;
      banco: string;
      agencia: string;
      conta: string;
      titular: string;
    }) => {
      const { id, ...updateData } = data;
      // Generate a default name based on bank and account info
      const nome = `${data.banco} - ${data.agencia}/${data.conta}`;
      
      const { data: result, error } = await supabase
        .from("contas_bancarias")
        .update({ ...updateData, nome })
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast({
        title: "Conta bancária atualizada",
        description: "A conta foi atualizada com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar conta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

export function useDeleteContaBancaria() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: number) => {
      const { error } = await supabase
        .from("contas_bancarias")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contas-bancarias"] });
      toast({
        title: "Conta bancária excluída",
        description: "A conta foi excluída com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir conta",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

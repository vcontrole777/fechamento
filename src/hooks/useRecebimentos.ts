
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "@/components/common/date-filter/types";
import { format } from "date-fns";

export type Recebimento = {
  id: number;
  data: string;
  valor: number;
  id_tripeiro: number;
  id_equipe: number;
  id_responsavel: number | null;
  banco: string | null;
  conta_depositada: string | null;
  tipo_deposito: string | null;
  numero_comprovante: string | null;
  observacoes: string | null;
  criado_em: string;
  atualizado_em: string;
  tripeiro?: {
    id: number;
    nome: string;
  };
  responsavel?: {
    nome: string;
  };
};

export function useRecebimentos(dateRange: DateRange, tripeiroId?: number) {
  return useQuery({
    queryKey: ["recebimentos", dateRange, tripeiroId],
    queryFn: async () => {
      const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

      let query = supabase
        .from("recebimentos")
        .select(`
          *,
          tripeiro:pessoas!recebimentos_id_tripeiro_fkey(id, nome),
          responsavel:pessoas!recebimentos_id_responsavel_fkey(nome)
        `);

      if (tripeiroId) {
        query = query.eq("id_tripeiro", tripeiroId);
      }

      if (fromDate && toDate && fromDate === toDate) {
        query = query.eq('data', fromDate);
      } else {
        if (fromDate) {
          query = query.gte('data', fromDate);
        }
        if (toDate) {
          query = query.lte('data', toDate);
        }
      }

      query = query.order("data", { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Erro ao carregar recebimentos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Recebimento[];
    },
  });
}

export function useAddRecebimento() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      data: Date;
      valor: number;
      valores_massa?: number[];
      id_tripeiro: number;
      id_responsavel?: number;
      banco?: string;
      conta_depositada?: string;
      tipo_deposito?: string;
      numero_comprovante?: string;
      observacoes?: string;
    }) => {
      const baseRecebimento = {
        data: format(data.data, 'yyyy-MM-dd'),
        id_tripeiro: data.id_tripeiro,
        id_responsavel: data.id_responsavel,
        banco: data.banco,
        conta_depositada: data.conta_depositada,
        tipo_deposito: data.tipo_deposito,
        numero_comprovante: data.numero_comprovante,
        observacoes: data.observacoes,
        id_equipe: 1 // TODO: Get from user context
      };

      // Se há valores em massa, criar múltiplos recebimentos
      if (data.valores_massa && data.valores_massa.length > 0) {
        const recebimentos = [
          { ...baseRecebimento, valor: data.valor },
          ...data.valores_massa.map(valor => ({ ...baseRecebimento, valor }))
        ];

        const { data: results, error } = await supabase
          .from("recebimentos")
          .insert(recebimentos)
          .select();

        if (error) throw error;
        return results;
      } else {
        // Recebimento único
        const { data: result, error } = await supabase
          .from("recebimentos")
          .insert([{ ...baseRecebimento, valor: data.valor }])
          .select()
          .single();

        if (error) throw error;
        return result;
      }
    },
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ["recebimentos"] });
      const isMultiple = Array.isArray(result);
      toast({
        title: isMultiple ? "Recebimentos adicionados" : "Recebimento adicionado",
        description: isMultiple 
          ? `${result.length} recebimentos foram registrados com sucesso.`
          : "O recebimento foi registrado com sucesso.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao adicionar recebimento",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}

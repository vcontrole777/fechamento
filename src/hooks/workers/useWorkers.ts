import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";
import { WorkerType } from "./workerConfig";

export type Worker = {
  id: number;
  nome: string;
  id_equipe: number;
  criado_em: string;
  porcentagem: number;
  tipo: WorkerType;
  id_indicador?: number | null;
  porcentagem_indicacao?: number | null;
};

const LABEL: Record<WorkerType, string> = {
  atendente: "atendentes",
  tripeiro: "tripeiros",
};

export function useWorkers(tipo: WorkerType) {
  const { toast } = useToast();
  const teamId = useEffectiveTeamId();
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchWorkers = async () => {
    if (!teamId) {
      setWorkers([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("tipo", tipo)
        .eq("id_equipe", teamId)
        .order("nome");

      if (error) throw error;

      setWorkers((data || []).map(item => ({
        ...item,
        porcentagem: item.porcentagem || 0,
      })) as Worker[]);
    } catch (error) {
      console.error(`Erro ao buscar ${LABEL[tipo]}:`, error);
      toast({
        title: `Erro ao carregar ${LABEL[tipo]}`,
        description: `Não foi possível carregar a lista de ${LABEL[tipo]}.`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkers();
  }, [teamId, tipo]);

  const deleteWorker = async (id: number) => {
    try {
      const { error } = await supabase.from("pessoas").delete().eq("id", id);
      if (error) throw error;

      fetchWorkers();
      return { success: true };
    } catch (error) {
      console.error(`Erro ao remover ${tipo}:`, error);
      return { success: false, error };
    }
  };

  return { workers, loading, fetchWorkers, deleteWorker };
}

import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useClearTeamData = () => {
  const [loading, setLoading] = useState(false);

  const clearTeamData = async (equipeId: number) => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('limpar_dados_equipe', {
        equipe_id: equipeId
      });

      if (error) throw error;

      toast({
        title: "Dados limpos com sucesso",
        description: "Todos os dados da equipe foram removidos do sistema",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error clearing team data:", error);
      toast({
        title: "Erro ao limpar dados",
        description: error.message || "Ocorreu um erro ao tentar limpar os dados da equipe",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { clearTeamData, loading };
};
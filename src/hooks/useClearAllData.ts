import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export const useClearAllData = () => {
  const [loading, setLoading] = useState(false);

  const clearAllData = async () => {
    try {
      setLoading(true);
      
      const { error } = await supabase.rpc('limpar_todos_dados');

      if (error) throw error;

      toast({
        title: "Dados limpos com sucesso",
        description: "Todos os dados do sistema foram removidos",
      });

      return { success: true };
    } catch (error: any) {
      console.error("Error clearing all data:", error);
      toast({
        title: "Erro ao limpar dados",
        description: error.message || "Ocorreu um erro ao tentar limpar os dados",
        variant: "destructive",
      });
      return { success: false, error };
    } finally {
      setLoading(false);
    }
  };

  return { clearAllData, loading };
};

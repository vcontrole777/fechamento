
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Attendant {
  id: number;
  nome: string;
  id_equipe: number;
  criado_em: string;
  porcentagem: number;
}

export function useAttendants() {
  const { toast } = useToast();
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendants = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("tipo", "atendente")
        .order("nome");

      if (error) {
        throw error;
      }

      // Make sure to handle the porcentagem field
      const typedData = data.map(item => ({
        ...item,
        porcentagem: item.porcentagem || 0
      })) as Attendant[];

      setAttendants(typedData);
    } catch (error) {
      console.error("Erro ao buscar atendentes:", error);
      toast({
        title: "Erro ao carregar atendentes",
        description: "Não foi possível carregar a lista de atendentes.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendants();
  }, []);

  // Function to delete an attendant
  const deleteAttendant = async (id: number) => {
    try {
      const { error } = await supabase
        .from("pessoas")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      fetchAttendants();
      
      return { success: true };
    } catch (error) {
      console.error("Erro ao remover atendente:", error);
      return { success: false, error };
    }
  };

  return {
    attendants,
    loading,
    fetchAttendants,
    deleteAttendant
  };
}

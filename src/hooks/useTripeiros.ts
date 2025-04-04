
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export interface Tripeiro {
  id: number;
  nome: string;
  id_equipe: number;
  criado_em: string;
  porcentagem: number;
}

export function useTripeiros() {
  const { toast } = useToast();
  const [tripeiros, setTripeiros] = useState<Tripeiro[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTripeiros = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from("pessoas")
        .select("*")
        .eq("tipo", "tripeiro")
        .order("nome");

      if (error) {
        throw error;
      }

      // Make sure to handle the porcentagem field
      const typedData = data.map(item => ({
        ...item,
        porcentagem: item.porcentagem || 0
      })) as Tripeiro[];

      setTripeiros(typedData);
    } catch (error) {
      console.error("Erro ao buscar tripeiros:", error);
      toast({
        title: "Erro ao carregar tripeiros",
        description: "Não foi possível carregar a lista de tripeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTripeiros();
  }, []);

  const handleDeleteTripeiro = async (id: number) => {
    try {
      const { error } = await supabase
        .from("pessoas")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
      
      fetchTripeiros();
      toast({
        title: "Tripeiro removido",
        description: "O tripeiro foi removido com sucesso.",
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao remover tripeiro:", error);
      toast({
        title: "Erro ao remover tripeiro",
        description: "Não foi possível remover o tripeiro.",
        variant: "destructive",
      });
      
      return false;
    }
  };

  return {
    tripeiros,
    loading,
    fetchTripeiros,
    handleDeleteTripeiro
  };
}


import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useTeamView } from "@/contexts/TeamViewContext";

export interface Attendant {
  id: number;
  nome: string;
  id_equipe: number;
  criado_em: string;
  porcentagem: number;
}

export function useAttendants() {
  const { toast } = useToast();
  const { viewingTeamId, isViewingAsTeam } = useTeamView();
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchAttendants = async () => {
    try {
      setLoading(true);

      // Get team ID to filter by
      let teamId: number | null = null;
      
      if (isViewingAsTeam && viewingTeamId) {
        teamId = viewingTeamId;
      } else {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { data: profile } = await supabase
            .from("profiles")
            .select("id_equipe")
            .eq("id", user.id)
            .single();
          teamId = profile?.id_equipe || null;
        }
      }
      
      let query = supabase
        .from("pessoas")
        .select("*")
        .eq("tipo", "atendente");

      // Filter by team
      if (teamId) {
        query = query.eq("id_equipe", teamId);
      }

      query = query.order("nome");

      const { data, error } = await query;

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
  }, [viewingTeamId]);

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

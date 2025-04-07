
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DateRange } from "@/components/common/date-filter/types";
import { useAuth } from "@/hooks/useAuth";

export type AttendantRanking = {
  position: number;
  id: number;
  name: string;
  totalAmount: number;
};

export type WeeklyRankingResponse = {
  startDate: string;
  endDate: string;
  ranking: AttendantRanking[];
};

export function useWeeklyAttendantRanking(dateRange: DateRange) {
  const { user } = useAuth();
  const formattedStartDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const formattedEndDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

  return useQuery({
    queryKey: ["weekly-attendant-ranking", formattedStartDate, formattedEndDate, user?.id],
    queryFn: async (): Promise<WeeklyRankingResponse> => {
      try {
        console.log("Fetching weekly attendant ranking with date range:", {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        // Get the user's team ID from user profile
        let teamId;
        
        if (user) {
          const { data: profileData, error: profileError } = await supabase
            .from("profiles")
            .select("id_equipe")
            .eq("id", user.id)
            .single();
          
          if (profileError) {
            console.error("Error fetching user profile:", profileError);
            throw new Error("Erro ao obter sua equipe");
          }
          
          teamId = profileData?.id_equipe;
          console.log("Retrieved team ID from user profile:", teamId);
        }
        
        if (!teamId) {
          throw new Error("Não foi possível determinar sua equipe");
        }

        const { data, error } = await supabase.functions.invoke("weekly-attendant-ranking", {
          body: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            teamId: teamId
          }
        });

        if (error) {
          console.error("Error invoking function:", error);
          throw new Error(error.message);
        }

        console.log("Weekly ranking response:", data);
        
        return data as WeeklyRankingResponse;
      } catch (error: any) {
        console.error("Weekly ranking error:", error);
        toast({
          title: "Erro ao carregar ranking semanal",
          description: error.message || "Falha ao buscar os dados",
          variant: "destructive",
        });
        throw error;
      }
    },
    enabled: Boolean(dateRange.from && dateRange.to && user),
  });
}

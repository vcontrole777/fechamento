
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DateRange } from "@/components/common/date-filter/types";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";

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
  const teamId = useEffectiveTeamId();
  const formattedStartDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const formattedEndDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

  return useQuery({
    queryKey: ["weekly-attendant-ranking", formattedStartDate, formattedEndDate, teamId],
    queryFn: async (): Promise<WeeklyRankingResponse> => {
      try {
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
    enabled: Boolean(dateRange.from && dateRange.to && teamId),
  });
}

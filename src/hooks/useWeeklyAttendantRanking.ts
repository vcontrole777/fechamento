
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DateRange } from "@/components/common/date-filter/types";

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
  const formattedStartDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const formattedEndDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

  return useQuery({
    queryKey: ["weekly-attendant-ranking", formattedStartDate, formattedEndDate],
    queryFn: async (): Promise<WeeklyRankingResponse> => {
      try {
        console.log("Fetching weekly attendant ranking with date range:", {
          startDate: formattedStartDate,
          endDate: formattedEndDate
        });

        // Get the current team ID from user context (this should ideally come from an auth context)
        // For now we're using a fixed value, but in a real app this would be dynamic
        const teamId = 1; // You should replace this with actual team ID from user context
        
        console.log("Using team ID:", teamId);

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
    enabled: Boolean(dateRange.from && dateRange.to),
  });
}

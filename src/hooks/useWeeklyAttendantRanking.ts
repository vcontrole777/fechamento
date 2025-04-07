
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

        const { data, error } = await supabase.functions.invoke("weekly-attendant-ranking", {
          body: {
            startDate: formattedStartDate,
            endDate: formattedEndDate,
            teamId: 1 // You might want to get this dynamically from user context
          }
        });

        if (error) {
          throw new Error(error.message);
        }

        return data as WeeklyRankingResponse;
      } catch (error) {
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

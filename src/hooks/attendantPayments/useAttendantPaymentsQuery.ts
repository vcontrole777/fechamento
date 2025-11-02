import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AttendantPayment } from "@/types/attendantPayment.types";
import { DateRange } from "@/components/common/date-filter/types";
import { format } from "date-fns";

export function useAttendantPaymentsQuery(dateRange: DateRange) {
  return useQuery({
    queryKey: ['attendant-payments', dateRange],
    queryFn: async () => {
      let query = supabase
        .from('pagamentos_atendentes')
        .select(`
          *
        `)
        .order('data_pagamento', { ascending: false });

      // Apply date range filter if provided
      if (dateRange.from) {
        const fromDate = format(dateRange.from, 'yyyy-MM-dd');
        query = query.gte('periodo_inicio', fromDate);
      }
      
      if (dateRange.to) {
        const toDate = format(dateRange.to, 'yyyy-MM-dd');
        query = query.lte('periodo_fim', toDate);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching attendant payments:', error);
        throw error;
      }

      // Fetch attendant names separately
      const paymentsWithAttendants = await Promise.all(
        (data || []).map(async (payment) => {
          const { data: attendantData } = await supabase
            .from('pessoas')
            .select('id, nome')
            .eq('id', payment.id_atendente)
            .single();

          return {
            ...payment,
            atendente: attendantData || undefined,
          };
        })
      );

      return paymentsWithAttendants as AttendantPayment[];
    },
  });
}

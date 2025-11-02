import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAddTripeiroPayment } from "@/hooks/tripeiroPayments/useAddTripeiroPayment";
import { useDeleteTripeiroPayment } from "@/hooks/tripeiroPayments/useDeleteTripeiroPayment";
import { DateRange } from "@/components/common/date-filter/types";
import { format } from "date-fns";
import { TripeiroPayment } from "@/types/tripeiroPayment.types";
import { useTeamView } from "@/contexts/TeamViewContext";

export function useTripeiroPayments(dateRange: DateRange) {
  const [selectedTripeiroId, setSelectedTripeiroId] = useState<number | null>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const { viewingTeamId } = useTeamView();

  const addPayment = useAddTripeiroPayment();
  const deletePayment = useDeleteTripeiroPayment();

  // Fetch all payments for the current date range
  const { data: allPayments = [] } = useQuery({
    queryKey: ["all-tripeiro-payments", dateRange.from, dateRange.to, viewingTeamId],
    queryFn: async () => {
      if (!dateRange.from || !dateRange.to) return [];

      const periodoInicio = format(dateRange.from, 'yyyy-MM-dd');
      const periodoFim = format(dateRange.to, 'yyyy-MM-dd');

      let query = supabase
        .from("pagamentos_tripeiros")
        .select("*")
        .eq("periodo_inicio", periodoInicio)
        .eq("periodo_fim", periodoFim);

      if (viewingTeamId !== null) {
        query = query.eq("id_equipe", viewingTeamId);
      }

      const { data, error } = await query.order("data_pagamento", { ascending: false });

      if (error) throw error;

      // Fetch tripeiro names
      const tripeiroIds = [...new Set(data?.map(p => p.id_tripeiro) || [])];
      const { data: tripeirosData } = await supabase
        .from("pessoas")
        .select("id, nome")
        .in("id", tripeiroIds);

      const tripeirosMap = new Map(tripeirosData?.map(t => [t.id, t.nome]) || []);

      return (data || []).map(payment => ({
        ...payment,
        tripeiro: payment.id_tripeiro ? {
          id: payment.id_tripeiro,
          nome: tripeirosMap.get(payment.id_tripeiro) || '',
        } : undefined,
      })) as TripeiroPayment[];
    },
    enabled: !!dateRange.from && !!dateRange.to,
  });

  const openRegisterDialog = (tripeiroId: number) => {
    setSelectedTripeiroId(tripeiroId);
    setIsRegisterDialogOpen(true);
  };

  const closeRegisterDialog = () => {
    setIsRegisterDialogOpen(false);
    setSelectedTripeiroId(null);
  };

  const openHistoryDialog = (tripeiroId: number) => {
    setSelectedTripeiroId(tripeiroId);
    setIsHistoryDialogOpen(true);
  };

  const closeHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
    setSelectedTripeiroId(null);
  };

  // Memoized functions to get payments for a specific tripeiro
  const getPaymentsForTripeiro = useMemo(() => {
    return (tripeiroId: number) => {
      return allPayments.filter(p => p.id_tripeiro === tripeiroId);
    };
  }, [allPayments]);

  const getTotalPaidForTripeiro = useMemo(() => {
    return (tripeiroId: number): number => {
      const payments = allPayments.filter(p => p.id_tripeiro === tripeiroId);
      return payments.reduce((sum, p) => sum + Number(p.valor_pago), 0);
    };
  }, [allPayments]);

  const getTripeiroPaymentStatus = useMemo(() => {
    return (tripeiroId: number): 'pendente' | 'pago_parcial' | 'pago_total' => {
      const payments = allPayments.filter(p => p.id_tripeiro === tripeiroId);
      if (payments.length === 0) return 'pendente';
      
      // Get the latest payment's status
      const latestPayment = payments[0];
      return latestPayment.status;
    };
  }, [allPayments]);

  return {
    selectedTripeiroId,
    isRegisterDialogOpen,
    isHistoryDialogOpen,
    openRegisterDialog,
    closeRegisterDialog,
    openHistoryDialog,
    closeHistoryDialog,
    addPayment,
    deletePayment,
    getPaymentsForTripeiro,
    getTotalPaidForTripeiro,
    getTripeiroPaymentStatus,
  };
}

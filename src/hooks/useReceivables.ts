
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { DateRange, Payment } from "@/types/payment.types";
import { TripeiroRecebimento, TripeiroWithPayments } from "@/components/receivables/types";

export function useReceivables(dateRange: DateRange) {
  const [selectedTripeiro, setSelectedTripeiro] = useState<TripeiroWithPayments | null>(null);
  const [isReceiptDialogOpen, setIsReceiptDialogOpen] = useState(false);

  // Format dates for database query
  const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
  const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;

  // Fetch tripeiros and their payment data
  const { data: tripeiroSummaries = [], isLoading, refetch } = useQuery({
    queryKey: ["tripeiro-receivables", dateRange],
    queryFn: async () => {
      console.log("Fetching tripeiro receivables with date range:", { fromDate, toDate });
      
      // First, fetch all tripeiros
      const { data: tripeiros, error: tripeiroError } = await supabase
        .from("pessoas")
        .select("id, nome, porcentagem")
        .eq("tipo", "tripeiro")
        .order("nome");
      
      if (tripeiroError) throw tripeiroError;
      
      // For each tripeiro, fetch their payment data with the date filter
      const tripeirosWithPayments = await Promise.all(
        tripeiros.map(async (tripeiro) => {
          let query = supabase
            .from("pagamentos")
            .select(`
              id, data, valor, porcentagem_tripeiro, status, tipo, id_atendente, id_tripeiro, porcentagem_atendente, criado_em, id_equipe
            `)
            .eq("id_tripeiro", tripeiro.id);
          
          // Apply date filters if provided
          if (fromDate) query = query.gte('data', fromDate);
          if (toDate) query = query.lte('data', toDate);
          
          const { data: payments, error: paymentsError } = await query;
          
          if (paymentsError) throw paymentsError;
          
          // Calculate the total payments amount for this tripeiro
          const totalPayments = payments.reduce((sum, payment) => sum + Number(payment.valor), 0);
          
          // Only count concluded payments for the receivable amount (calculation corrected)
          const completedPayments = payments.filter(payment => payment.status === "concluido");
          
          // Corrected calculation: For each concluded payment, calculate the commission amount
          // based on porcentagem_tripeiro (percentage the tripeiro receives)
          const totalReceivable = completedPayments.reduce((sum, payment) => {
            const amount = Number(payment.valor);
            const percentage = Number(payment.porcentagem_tripeiro);
            return sum + (amount * percentage / 100);
          }, 0);

          const completedAmount = completedPayments.reduce((sum, payment) => sum + Number(payment.valor), 0);
          
          // Fetch receipt records for this tripeiro
          const { data: receipts, error: receiptsError } = await supabase
            .from('tripeiro_recebimentos')
            .select('*')
            .eq('id_tripeiro', tripeiro.id);
            
          if (receiptsError) {
            console.error("Error fetching receipts:", receiptsError);
            throw receiptsError;
          }
          
          // Cast receipts to the correct type
          const typedReceipts = receipts as unknown as TripeiroRecebimento[];
          
          // Calculate total received amount from receipt records
          const totalReceived = typedReceipts ? typedReceipts.reduce((sum, receipt) => sum + Number(receipt.valor), 0) : 0;
          
          return {
            ...tripeiro,
            payments: payments as unknown as Payment[],
            receipts: typedReceipts || [],
            totalPayments,
            totalReceivable,
            completedAmount,
            totalReceived
          } as TripeiroWithPayments;
        })
      );
      
      return tripeirosWithPayments;
    }
  });

  const handleOpenReceiptDialog = (tripeiro: TripeiroWithPayments) => {
    setSelectedTripeiro(tripeiro);
    setIsReceiptDialogOpen(true);
  };

  const handleCloseReceiptDialog = () => {
    setIsReceiptDialogOpen(false);
  };

  return {
    tripeiroSummaries,
    isLoading,
    refetch,
    selectedTripeiro,
    isReceiptDialogOpen,
    handleOpenReceiptDialog,
    handleCloseReceiptDialog,
    setIsReceiptDialogOpen
  };
}

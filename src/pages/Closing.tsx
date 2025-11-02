
import { useEffect, useState } from "react";
import { useClosingData } from "@/hooks/useClosingData";
import { ClosingSummary } from "@/components/closing/ClosingSummary";
import { TripeiroReceivablesTable } from "@/components/closing/TripeiroReceivablesTable";
import { AttendantCommissionsTable } from "@/components/closing/AttendantCommissionsTable";
import { CopyToWhatsAppButton } from "@/components/closing/CopyToWhatsAppButton";
import { DateFilter, DateFilterOption } from "@/components/common/DateFilter";
import { GeneratePDFButton } from "@/components/closing/GeneratePDFButton";
import { RegisterAttendantPaymentDialog } from "@/components/closing/RegisterAttendantPaymentDialog";
import { AttendantPaymentHistory } from "@/components/closing/AttendantPaymentHistory";
import { format } from "date-fns";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { DateRange } from "@/components/common/date-filter/types";
import { useAttendantPayments } from "@/hooks/useAttendantPayments";
import { AttendantPaymentFormData } from "@/components/closing/schemas/attendantPaymentSchema";
import { useTripeiroPayments } from "@/hooks/closing/useTripeiroPayments";
import { RegisterTripeiroPaymentDialog } from "@/components/closing/RegisterTripeiroPaymentDialog";
import { TripeiroPaymentHistory } from "@/components/closing/TripeiroPaymentHistory";
import { TripeiroPaymentFormData } from "@/components/closing/schemas/tripeiroPaymentSchema";
import { supabase } from "@/integrations/supabase/client";

export default function Closing() {
  const {
    isLoading,
    closingSummary,
    tripeiroSummaries,
    attendantSummaries,
    expenses,
    dateRange,
    updateDateRange,
  } = useClosingData();

  // Get shared date filter update function
  const { updateSharedDateFilter } = useSharedDateFilter();

  // Attendant payments hook
  const attendantPaymentsHook = useAttendantPayments(dateRange);
  const [selectedAttendantForPayment, setSelectedAttendantForPayment] = useState<{
    id: number;
    name: string;
    commission: number;
  } | null>(null);

  // Tripeiro payments hook
  const tripeiroPaymentsHook = useTripeiroPayments(dateRange);
  const [selectedTripeiroForPayment, setSelectedTripeiroForPayment] = useState<{
    id: number;
    name: string;
    receivable: number;
  } | null>(null);

  // Force refetch when component mounts
  useEffect(() => {
    // The query hooks already fetch data based on the dateRange
  }, []);

  // Format currency in Brazilian style (R$ 1.000,00)
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleDateFilterChange = (newDateRange: DateRange, option: DateFilterOption) => {
    console.log("Date filter changed on Closing page:", {
      from: newDateRange.from ? format(newDateRange.from, 'yyyy-MM-dd') : null,
      to: newDateRange.to ? format(newDateRange.to, 'yyyy-MM-dd') : null,
      option
    });
    
    // Update both our local state and the shared state
    updateDateRange(newDateRange);
    updateSharedDateFilter(newDateRange, option);
  };

  const handleRegisterPayment = (attendantId: number) => {
    const attendant = attendantSummaries.find(a => a.id === attendantId);
    if (attendant) {
      setSelectedAttendantForPayment({
        id: attendant.id,
        name: attendant.nome,
        commission: attendant.totalCommission,
      });
      attendantPaymentsHook.openRegisterDialog(attendantId);
    }
  };

  const handleViewHistory = (attendantId: number) => {
    attendantPaymentsHook.openHistoryDialog(attendantId);
  };

  const handleSubmitPayment = async (data: AttendantPaymentFormData) => {
    if (!selectedAttendantForPayment) return;

    // Get user's team ID from profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id_equipe')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profileData?.id_equipe) {
      return;
    }

    await attendantPaymentsHook.addPayment.mutateAsync({
      id_atendente: selectedAttendantForPayment.id,
      id_equipe: profileData.id_equipe,
      valor_comissao: selectedAttendantForPayment.commission,
      valor_pago: data.valor_pago,
      data_pagamento: data.data_pagamento,
      periodo_inicio: dateRange.from!,
      periodo_fim: dateRange.to!,
      metodo_pagamento: data.metodo_pagamento,
      observacoes: data.observacoes,
    });

    attendantPaymentsHook.closeRegisterDialog();
    setSelectedAttendantForPayment(null);
  };

  const handleDeletePayment = (paymentId: string) => {
    attendantPaymentsHook.deletePayment.mutate(paymentId);
  };

  // Tripeiro payment handlers
  const handleRegisterTripeiroPayment = (tripeiroId: number) => {
    const tripeiro = tripeiroSummaries.find(t => t.id === tripeiroId);
    if (tripeiro) {
      setSelectedTripeiroForPayment({
        id: tripeiro.id,
        name: tripeiro.nome,
        receivable: tripeiro.totalReceivable,
      });
      tripeiroPaymentsHook.openRegisterDialog(tripeiroId);
    }
  };

  const handleViewTripeiroHistory = (tripeiroId: number) => {
    tripeiroPaymentsHook.openHistoryDialog(tripeiroId);
  };

  const handleSubmitTripeiroPayment = async (data: TripeiroPaymentFormData) => {
    if (!selectedTripeiroForPayment) return;

    // Get user's team ID from profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id_equipe')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profileData?.id_equipe) {
      return;
    }

    await tripeiroPaymentsHook.addPayment.mutateAsync({
      id_tripeiro: selectedTripeiroForPayment.id,
      id_equipe: profileData.id_equipe,
      valor_a_receber: selectedTripeiroForPayment.receivable,
      valor_pago: data.valor_pago,
      data_pagamento: data.data_pagamento,
      periodo_inicio: format(dateRange.from!, 'yyyy-MM-dd'),
      periodo_fim: format(dateRange.to!, 'yyyy-MM-dd'),
      metodo_pagamento: data.metodo_pagamento,
      observacoes: data.observacoes,
    });

    tripeiroPaymentsHook.closeRegisterDialog();
    setSelectedTripeiroForPayment(null);
  };

  const handleDeleteTripeiroPayment = (paymentId: string) => {
    tripeiroPaymentsHook.deletePayment.mutate(paymentId);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight glow-text">Fechamento</h1>
        <div className="flex space-x-2">
          <GeneratePDFButton
            closingSummary={closingSummary}
            tripeiroSummaries={tripeiroSummaries}
            attendantSummaries={attendantSummaries}
            expenses={expenses}
            dateRange={dateRange}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
          />
          <CopyToWhatsAppButton 
            closingSummary={closingSummary}
            tripeiroSummaries={tripeiroSummaries}
            attendantSummaries={attendantSummaries}
            expenses={expenses}
            dateRange={dateRange}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <DateFilter onFilterChange={handleDateFilterChange} />
        </div>
        
        <ClosingSummary 
          summary={closingSummary} 
          formatCurrency={formatCurrency} 
          isLoading={isLoading} 
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Valores a Receber (Tripeiros)</h2>
          <TripeiroReceivablesTable 
            tripeiroSummaries={tripeiroSummaries} 
            formatCurrency={formatCurrency}
            onRegisterPayment={handleRegisterTripeiroPayment}
            onViewHistory={handleViewTripeiroHistory}
            getPaymentStatus={tripeiroPaymentsHook.getTripeiroPaymentStatus}
            getTotalPaid={tripeiroPaymentsHook.getTotalPaidForTripeiro}
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Comissões (Atendentes)</h2>
          <AttendantCommissionsTable 
            attendantSummaries={attendantSummaries} 
            formatCurrency={formatCurrency}
            onRegisterPayment={handleRegisterPayment}
            onViewHistory={handleViewHistory}
            getPaymentStatus={attendantPaymentsHook.getAttendantPaymentStatus}
            getTotalPaid={attendantPaymentsHook.getTotalPaidForAttendant}
          />
        </div>
      </div>

      {/* Dialogs */}
      {selectedAttendantForPayment && (
        <RegisterAttendantPaymentDialog
          open={attendantPaymentsHook.isRegisterDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              attendantPaymentsHook.closeRegisterDialog();
              setSelectedAttendantForPayment(null);
            }
          }}
          attendantId={selectedAttendantForPayment.id}
          attendantName={selectedAttendantForPayment.name}
          totalCommission={selectedAttendantForPayment.commission}
          totalPaid={attendantPaymentsHook.getTotalPaidForAttendant(selectedAttendantForPayment.id)}
          formatCurrency={formatCurrency}
          dateRange={dateRange}
          onSubmit={handleSubmitPayment}
          isSubmitting={attendantPaymentsHook.addPayment.isPending}
        />
      )}

      {attendantPaymentsHook.selectedAttendantId && (
        <AttendantPaymentHistory
          open={attendantPaymentsHook.isHistoryDialogOpen}
          onOpenChange={attendantPaymentsHook.closeHistoryDialog}
          attendantName={
            attendantSummaries.find(a => a.id === attendantPaymentsHook.selectedAttendantId)?.nome || ''
          }
          payments={attendantPaymentsHook.getPaymentsForAttendant(attendantPaymentsHook.selectedAttendantId)}
          formatCurrency={formatCurrency}
          onDeletePayment={handleDeletePayment}
        />
      )}

      {/* Tripeiro Payment Dialogs */}
      {selectedTripeiroForPayment && (
        <RegisterTripeiroPaymentDialog
          open={tripeiroPaymentsHook.isRegisterDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              tripeiroPaymentsHook.closeRegisterDialog();
              setSelectedTripeiroForPayment(null);
            }
          }}
          tripeiro={{
            id: selectedTripeiroForPayment.id,
            nome: selectedTripeiroForPayment.name,
            valorAReceber: selectedTripeiroForPayment.receivable,
            periodoInicio: format(dateRange.from!, 'yyyy-MM-dd'),
            periodoFim: format(dateRange.to!, 'yyyy-MM-dd'),
          }}
        />
      )}

      {tripeiroPaymentsHook.selectedTripeiroId && (
        <TripeiroPaymentHistory
          open={tripeiroPaymentsHook.isHistoryDialogOpen}
          onOpenChange={tripeiroPaymentsHook.closeHistoryDialog}
          tripeiro={{
            id: tripeiroPaymentsHook.selectedTripeiroId,
            nome: tripeiroSummaries.find(t => t.id === tripeiroPaymentsHook.selectedTripeiroId)?.nome || '',
            periodoInicio: format(dateRange.from!, 'yyyy-MM-dd'),
            periodoFim: format(dateRange.to!, 'yyyy-MM-dd'),
          }}
          formatCurrency={formatCurrency}
        />
      )}
    </div>
  );
}

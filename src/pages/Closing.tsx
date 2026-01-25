
import { useEffect, useState } from "react";
import { useClosingData } from "@/hooks/useClosingData";
import { ClosingSummary } from "@/components/closing/ClosingSummary";
import { TripeiroReceivablesTable } from "@/components/closing/TripeiroReceivablesTable";
import { AttendantCommissionsTable } from "@/components/closing/AttendantCommissionsTable";
import { DateFilter, DateFilterOption } from "@/components/common/DateFilter";
import { ExportMenu } from "@/components/closing/ExportMenu";
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
import { toast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

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
    console.log('=== handleSubmitPayment chamado ===');
    console.log('Data recebida:', data);
    console.log('selectedAttendantForPayment:', selectedAttendantForPayment);
    console.log('dateRange:', {
      from: dateRange.from,
      to: dateRange.to,
      fromType: typeof dateRange.from,
      toType: typeof dateRange.to,
      fromIsDate: dateRange.from instanceof Date,
      toIsDate: dateRange.to instanceof Date,
    });
    
    if (!selectedAttendantForPayment) {
      console.error('Nenhum atendente selecionado');
      toast({
        title: "Erro",
        description: "Nenhum atendente selecionado",
        variant: "destructive"
      });
      return;
    }

    if (!dateRange.from) {
      console.error('Data inicial não definida');
      toast({
        title: "Erro",
        description: "Por favor, selecione um período antes de registrar pagamentos",
        variant: "destructive"
      });
      return;
    }

    // Se to não estiver definido, usar o mesmo valor de from
    const periodoFim = dateRange.to || dateRange.from;

    // Get user's team ID from profile
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('id_equipe')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    console.log('Profile data:', profileData);
    console.log('Profile error:', profileError);

    if (!profileData?.id_equipe) {
      console.error('Equipe não encontrada no perfil');
      toast({
        title: "Erro",
        description: "Equipe não encontrada. Verifique seu perfil.",
        variant: "destructive"
      });
      return;
    }

    const paymentData = {
      id_atendente: selectedAttendantForPayment.id,
      id_equipe: profileData.id_equipe,
      valor_comissao: selectedAttendantForPayment.commission,
      valor_pago: data.valor_pago,
      data_pagamento: data.data_pagamento,
      periodo_inicio: dateRange.from,
      periodo_fim: periodoFim,
      metodo_pagamento: data.metodo_pagamento,
      observacoes: data.observacoes,
    };

    console.log('Dados que serão enviados:', paymentData);

    try {
      await attendantPaymentsHook.addPayment.mutateAsync(paymentData);
      console.log('Pagamento registrado com sucesso');
      attendantPaymentsHook.closeRegisterDialog();
      setSelectedAttendantForPayment(null);
    } catch (error) {
      console.error('Erro ao registrar pagamento:', error);
    }
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
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-center">
        <div>
          <h1 className="text-headline text-foreground">Fechamento Financeiro</h1>
          <p className="text-sm text-muted-foreground mt-1">Gerencie recebimentos e pagamentos do período</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <DateFilter onFilterChange={handleDateFilterChange} />
          <ExportMenu
            closingSummary={closingSummary}
            tripeiroSummaries={tripeiroSummaries}
            attendantSummaries={attendantSummaries}
            expenses={expenses}
            dateRange={dateRange}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Resumo Consolidado */}
      <Card>
        <CardContent>
          <ClosingSummary 
            summary={closingSummary} 
            formatCurrency={formatCurrency} 
            isLoading={isLoading} 
          />
        </CardContent>
      </Card>

      {/* Tabs para Recebimentos e Pagamentos */}
      <Tabs defaultValue="recebimentos" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="recebimentos" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span>Valores a Receber</span>
          </TabsTrigger>
          <TabsTrigger value="pagamentos" className="flex items-center gap-2">
            <TrendingDown className="h-4 w-4" />
            <span>Comissões a Pagar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="recebimentos" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              Recebimentos dos Tripeiros
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie os valores a receber dos tripeiros no período selecionado
            </p>
            <TripeiroReceivablesTable 
              tripeiroSummaries={tripeiroSummaries} 
              formatCurrency={formatCurrency}
              onRegisterPayment={handleRegisterTripeiroPayment}
              onViewHistory={handleViewTripeiroHistory}
              getPaymentStatus={tripeiroPaymentsHook.getTripeiroPaymentStatus}
              getTotalPaid={tripeiroPaymentsHook.getTotalPaidForTripeiro}
            />
          </div>
        </TabsContent>

        <TabsContent value="pagamentos" className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              Comissões dos Atendentes
            </h2>
            <p className="text-sm text-muted-foreground mb-4">
              Gerencie as comissões a pagar aos atendentes no período selecionado
            </p>
            <AttendantCommissionsTable 
              attendantSummaries={attendantSummaries} 
              formatCurrency={formatCurrency}
              onRegisterPayment={handleRegisterPayment}
              onViewHistory={handleViewHistory}
              getPaymentStatus={attendantPaymentsHook.getAttendantPaymentStatus}
              getTotalPaid={attendantPaymentsHook.getTotalPaidForAttendant}
            />
          </div>
        </TabsContent>
      </Tabs>

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

import { useEffect } from "react";
import { usePayments } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { PaymentStats } from "@/components/payments/PaymentStats";
import PaymentsTable from "@/components/payments/PaymentsTable";
import NewPaymentDialog from "@/components/payments/NewPaymentDialog";
import EditPaymentDialog from "@/components/payments/EditPaymentDialog";
import DeletePaymentDialog from "@/components/payments/DeletePaymentDialog";
import EmptyPaymentsState from "@/components/payments/EmptyPaymentsState";
import { PaymentFiltersComponent } from "@/components/payments/PaymentFilters";
import { DateFilter, DateFilterOption } from "@/components/common/DateFilter";
import { format } from "date-fns";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { PaymentsExportMenu } from "@/components/payments/PaymentsExportMenu";

export default function Payments() {
  const {
    payments,
    isLoading,
    totalPayments,
    totalAttendantCommission,
    totalTripeiroReceivable,
    filters,
    dateRange,
    updateFilters,
    updateDateRange,
    refetch,
    isAddingPayment,
    isEditingPayment,
    isDeletingPayment,
    selectedPayment,
    openAddPaymentDialog,
    closeAddPaymentDialog,
    openEditPaymentDialog,
    closeEditPaymentDialog,
    openDeletePaymentDialog,
    closeDeletePaymentDialog,
  } = usePayments();

  const { updateSharedDateFilter } = useSharedDateFilter();

  const hasActiveFilters = filters.attendantIds.length > 0 || filters.tripeiroIds.length > 0;

  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleDateFilterChange = (newDateRange, option: DateFilterOption) => {
    console.log("Date filter changed on Payments page:", {
      from: newDateRange.from ? format(newDateRange.from, 'yyyy-MM-dd') : null,
      to: newDateRange.to ? format(newDateRange.to, 'yyyy-MM-dd') : null,
      option
    });
    
    updateDateRange(newDateRange);
    updateSharedDateFilter(newDateRange, option);
  };

  return (
    <div className="p-4 md:p-6 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:justify-between md:items-start">
        <div>
          <h1 className="text-headline text-foreground">Pagamentos</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Registre e acompanhe todos os pagamentos do sistema
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={openAddPaymentDialog}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Novo Pagamento
          </Button>
          <PaymentsExportMenu
            payments={payments}
            filters={filters}
            dateRange={dateRange}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      {/* Filtro de Data */}
      <div className="flex justify-start">
        <DateFilter onFilterChange={handleDateFilterChange} />
      </div>

      {/* Cards de Estatísticas */}
      <PaymentStats
        totalPayments={totalPayments}
        attendantCommission={totalAttendantCommission}
        tripeiroReceivable={totalTripeiroReceivable}
        isLoading={isLoading}
        formatCurrency={formatCurrency}
      />

      {/* Seção de Filtros e Tabela */}
      <Card>
        <CardContent className="space-y-4">
          <PaymentFiltersComponent 
            filters={filters} 
            onUpdateFilters={updateFilters} 
          />

          {isLoading ? (
            <div className="w-full h-96 flex items-center justify-center">
              <div className="animate-pulse text-lg">Carregando pagamentos...</div>
            </div>
          ) : payments && payments.length > 0 ? (
            <PaymentsTable
              payments={payments}
              onEditClick={openEditPaymentDialog}
              onDeleteClick={openDeletePaymentDialog}
              formatCurrency={formatCurrency}
            />
          ) : (
            <EmptyPaymentsState onAddClick={openAddPaymentDialog} />
          )}
        </CardContent>
      </Card>

      <NewPaymentDialog
        open={isAddingPayment}
        onOpenChange={closeAddPaymentDialog}
        onSuccess={refetch}
      />

      <EditPaymentDialog
        open={isEditingPayment}
        onOpenChange={closeEditPaymentDialog}
        payment={selectedPayment}
        onSuccess={refetch}
      />

      <DeletePaymentDialog
        open={isDeletingPayment}
        onOpenChange={closeDeletePaymentDialog}
        payment={selectedPayment}
        onSuccess={refetch}
      />
    </div>
  );
}


import { useEffect } from "react";
import { usePayments } from "@/hooks/usePayments";
import { Button } from "@/components/ui/button";
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
import { CopyToWhatsAppButton } from "@/components/payments/CopyToWhatsAppButton";

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

  // Get shared date filter update function
  const { updateSharedDateFilter } = useSharedDateFilter();

  // Verificar se há filtros ativos
  const hasActiveFilters = filters.attendantIds.length > 0 || filters.tripeiroIds.length > 0;

  // Force refetch when component mounts
  useEffect(() => {
    refetch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Format currency in Brazilian style (R$ 1.000,00)
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
    
    // Update both our local state and the shared state
    updateDateRange(newDateRange);
    updateSharedDateFilter(newDateRange, option);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
        <Button onClick={openAddPaymentDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Pagamento
        </Button>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <DateFilter onFilterChange={handleDateFilterChange} />
          <CopyToWhatsAppButton 
            payments={payments} 
            isVisible={!isLoading && payments.length > 0} 
          />
        </div>
        
        <div className="w-full flex justify-center">
          <PaymentStats
            totalPayments={totalPayments}
            attendantCommission={totalAttendantCommission}
            tripeiroReceivable={totalTripeiroReceivable}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
          />
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <PaymentFiltersComponent 
            filters={filters} 
            onUpdateFilters={updateFilters} 
          />
          {hasActiveFilters && payments.length > 0 && (
            <CopyToWhatsAppButton 
              payments={payments} 
              isVisible={true} 
            />
          )}
        </div>

        {isLoading ? (
          <div className="w-full h-96 flex items-center justify-center">
            <div className="animate-pulse">Carregando...</div>
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
      </div>

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

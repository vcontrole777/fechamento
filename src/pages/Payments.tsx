
import { useState } from "react";
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

export default function Payments() {
  const {
    payments,
    isLoading,
    totalPayments,
    totalAttendantCommission,
    totalTripeiroReceivable,
    filters,
    updateFilters,
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Pagamentos</h1>
        <Button onClick={openAddPaymentDialog}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Pagamento
        </Button>
      </div>

      <PaymentStats
        totalPayments={totalPayments}
        attendantCommission={totalAttendantCommission}
        tripeiroReceivable={totalTripeiroReceivable}
        isLoading={isLoading}
      />

      <div className="space-y-4">
        <PaymentFiltersComponent 
          filters={filters} 
          onUpdateFilters={updateFilters} 
        />

        {isLoading ? (
          <div className="w-full h-96 flex items-center justify-center">
            <div className="animate-pulse">Carregando...</div>
          </div>
        ) : payments && payments.length > 0 ? (
          <PaymentsTable
            payments={payments}
            onEditClick={openEditPaymentDialog}
            onDeleteClick={openDeletePaymentDialog}
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

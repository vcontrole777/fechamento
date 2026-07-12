import { useState } from "react";
import { DateRange } from "@/components/common/date-filter/types";
import { WorkerType, derivePaymentStatus } from "./workerConfig";
import { useWorkerPaymentsQuery } from "./useWorkerPaymentsQuery";
import { useAddWorkerPayment } from "./useAddWorkerPayment";
import { useUpdateWorkerPayment } from "./useUpdateWorkerPayment";
import { useDeleteWorkerPayment } from "./useDeleteWorkerPayment";

// Combina consulta, mutacoes e estado de dialogo pra um tipo de trabalhador.
// Substitui useAttendantPayments.ts e hooks/closing/useTripeiroPayments.ts,
// que faziam a mesma coisa de forma independente pra cada tipo.
export function useWorkerPayments(tipo: WorkerType, dateRange: DateRange) {
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState<number | null>(null);

  const { data: payments = [], isLoading } = useWorkerPaymentsQuery(tipo, dateRange);
  const addPayment = useAddWorkerPayment(tipo);
  const updatePayment = useUpdateWorkerPayment(tipo);
  const deletePayment = useDeleteWorkerPayment(tipo);

  const openRegisterDialog = (workerId: number) => {
    setSelectedWorkerId(workerId);
    setIsRegisterDialogOpen(true);
  };

  const closeRegisterDialog = () => {
    setIsRegisterDialogOpen(false);
    setSelectedWorkerId(null);
  };

  const openHistoryDialog = (workerId: number) => {
    setSelectedWorkerId(workerId);
    setIsHistoryDialogOpen(true);
  };

  const closeHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
    setSelectedWorkerId(null);
  };

  const getPaymentsForWorker = (workerId: number) => {
    return payments.filter(p => p.workerId === workerId);
  };

  const getTotalPaidForWorker = (workerId: number): number => {
    return getPaymentsForWorker(workerId).reduce((sum, p) => sum + Number(p.valor_pago), 0);
  };

  // Recalcula ao vivo a partir dos pagamentos, em vez de confiar no status
  // gravado na ultima linha (que pode ficar desatualizado se um pagamento
  // for editado ou apagado depois).
  const getPaymentStatus = (workerId: number, totalDue: number) => {
    return derivePaymentStatus(getTotalPaidForWorker(workerId), totalDue);
  };

  return {
    payments,
    isLoading,
    isRegisterDialogOpen,
    isHistoryDialogOpen,
    selectedWorkerId,
    openRegisterDialog,
    closeRegisterDialog,
    openHistoryDialog,
    closeHistoryDialog,
    addPayment,
    updatePayment,
    deletePayment,
    getPaymentsForWorker,
    getTotalPaidForWorker,
    getPaymentStatus,
  };
}

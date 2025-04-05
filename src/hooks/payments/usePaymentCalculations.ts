
import { Payment } from "@/types/payment.types";

export function usePaymentCalculations() {
  const calculateTotals = (payments: Payment[] = []) => {
    if (!payments || payments.length === 0) {
      return {
        totalPayments: 0,
        totalAttendantCommission: 0,
        totalTripeiroReceivable: 0,
        netTotal: 0
      };
    }

    // Filter only completed payments for totals calculation
    const completedPayments = payments.filter(payment => payment.status === "concluido");

    return completedPayments.reduce((acc, payment) => {
      const totalPayment = Number(payment.valor);
      const tripeiroCommission = totalPayment * (payment.porcentagem_tripeiro / 100);
      const tripeiroReceivable = totalPayment - tripeiroCommission;
      const attendantCommission = tripeiroReceivable * (payment.porcentagem_atendente / 100);
      const netTotal = totalPayment - tripeiroCommission - attendantCommission;

      return {
        totalPayments: acc.totalPayments + totalPayment,
        totalAttendantCommission: acc.totalAttendantCommission + attendantCommission,
        totalTripeiroReceivable: acc.totalTripeiroReceivable + tripeiroReceivable,
        netTotal: acc.netTotal + netTotal
      };
    }, {
      totalPayments: 0,
      totalAttendantCommission: 0,
      totalTripeiroReceivable: 0,
      netTotal: 0
    });
  };

  return {
    calculateTotals
  };
}

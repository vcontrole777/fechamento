
import { Payment } from "@/types/payment.types";
import { splitCommission } from "@/utils/commission";

export function usePaymentCalculations() {
  const calculateTotals = (payments: Payment[] = []) => {
    if (!payments || payments.length === 0) {
      return {
        totalPayments: 0,
        totalAttendantCommission: 0,
        totalTripeiroReceivable: 0,
        totalReferralCommission: 0,
        netTotal: 0
      };
    }

    // Filter only completed payments for totals calculation
    const completedPayments = payments.filter(payment => payment.status === "concluido");

    return completedPayments.reduce((acc, payment) => {
      const totalPayment = Number(payment.valor);
      const split = splitCommission(payment);

      return {
        totalPayments: acc.totalPayments + totalPayment,
        totalAttendantCommission: acc.totalAttendantCommission + split.attendantCommission,
        totalTripeiroReceivable: acc.totalTripeiroReceivable + split.tripeiroReceivable,
        totalReferralCommission: acc.totalReferralCommission + split.referralCommission,
        netTotal: acc.netTotal + split.netValue
      };
    }, {
      totalPayments: 0,
      totalAttendantCommission: 0,
      totalTripeiroReceivable: 0,
      totalReferralCommission: 0,
      netTotal: 0
    });
  };

  return {
    calculateTotals
  };
}

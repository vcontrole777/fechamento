
import { Payment } from "@/types/payment.types";

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
      
      // Use the most current percentages from the related entities
      const tripeiroPercentage = payment.tripeiro?.porcentagem || payment.porcentagem_tripeiro;
      const attendantPercentage = payment.atendente?.porcentagem || payment.porcentagem_atendente;
      
      const tripeiroCommission = totalPayment * (tripeiroPercentage / 100);
      const tripeiroReceivable = totalPayment - tripeiroCommission;
      const attendantCommission = tripeiroReceivable * (attendantPercentage / 100);
      
      // Calculate referral commission if attendant was referred
      const referralPercentage = (payment.atendente as any)?.porcentagem_indicacao || 0;
      const referralCommission = attendantCommission * (referralPercentage / 100);
      
      const netTotal = totalPayment - tripeiroCommission - attendantCommission - referralCommission;

      return {
        totalPayments: acc.totalPayments + totalPayment,
        totalAttendantCommission: acc.totalAttendantCommission + attendantCommission,
        totalTripeiroReceivable: acc.totalTripeiroReceivable + tripeiroReceivable,
        totalReferralCommission: acc.totalReferralCommission + referralCommission,
        netTotal: acc.netTotal + netTotal
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

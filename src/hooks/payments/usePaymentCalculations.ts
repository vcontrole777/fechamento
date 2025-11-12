
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
      
      // Use the percentage that was saved at the time of payment creation
      const tripeiroPercentage = payment.porcentagem_tripeiro;
      const attendantPercentage = payment.porcentagem_atendente;
      
      // Step 1: Tripeiro commission
      const tripeiroCommission = totalPayment * (tripeiroPercentage / 100);
      const tripeiroReceivable = totalPayment - tripeiroCommission;
      
      // Step 2: Calculate attendant pool
      const attendantPool = tripeiroReceivable * (attendantPercentage / 100);
      
      // Step 3: Check if attendant has referrer (indicador)
      const referralPercentage = (payment.atendente as any)?.porcentagem_indicacao || 0;
      
      let attendantCommission: number;
      let referralCommission: number;
      
      if (referralPercentage > 0) {
        // WITH INDICADOR: Split the pool
        referralCommission = attendantPool * (referralPercentage / 100);
        attendantCommission = attendantPool - referralCommission;
      } else {
        // WITHOUT INDICADOR: Attendant gets the full pool
        attendantCommission = attendantPool;
        referralCommission = 0;
      }
      
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

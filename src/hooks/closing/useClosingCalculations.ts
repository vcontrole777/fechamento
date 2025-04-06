
import { Payment } from "@/types/payment.types";

export type TripeiroSummary = {
  id: number;
  nome: string;
  totalReceivable: number;
  paymentsCount: number;
  porcentagemDecimal: number; // Add percentage as decimal
};

export type AttendantSummary = {
  id: number;
  nome: string;
  totalCommission: number;
  paymentsCount: number;
  porcentagemDecimal: number; // Add percentage as decimal
};

export type ClosingSummary = {
  totalRevenue: number;
  totalExpenses: number;
  totalAttendantCommission: number;
  totalTripeiroCommission: number;
  netProfit: number;
  paymentsCount: number;
  expensesCount: number;
};

export function useClosingCalculations() {
  // Calculate the closing summary
  const calculateClosingSummary = (payments: Payment[], expenses: any[]): ClosingSummary => {
    // Only consider completed payments
    const completedPayments = payments.filter(payment => payment.status === "concluido");
    
    // Calculate total revenue
    const totalRevenue = completedPayments.reduce(
      (sum, payment) => sum + Number(payment.valor), 
      0
    );
    
    // Calculate total expenses
    const totalExpenses = expenses.reduce(
      (sum, expense) => sum + Number(expense.valor), 
      0
    );
    
    // Calculate tripeiro and attendant commissions
    const commissions = completedPayments.reduce(
      (acc, payment) => {
        const totalPayment = Number(payment.valor);
        const tripeiroPercentage = payment.porcentagem_tripeiro || 0;
        const atendentePercentage = payment.porcentagem_atendente || 0;
        
        const tripeiroCommission = totalPayment * (tripeiroPercentage / 100);
        const atendenteCommission = (totalPayment - tripeiroCommission) * (atendentePercentage / 100);
        
        return {
          tripeiro: acc.tripeiro + tripeiroCommission,
          atendente: acc.atendente + atendenteCommission
        };
      },
      { tripeiro: 0, atendente: 0 }
    );
    
    // Calculate net profit
    const netProfit = totalRevenue - commissions.tripeiro - commissions.atendente - totalExpenses;
    
    return {
      totalRevenue,
      totalExpenses,
      totalAttendantCommission: commissions.atendente,
      totalTripeiroCommission: commissions.tripeiro,
      netProfit,
      paymentsCount: completedPayments.length,
      expensesCount: expenses.length
    };
  };

  // Calculate tripeiro receivables
  const calculateTripeiroSummaries = (payments: Payment[]): TripeiroSummary[] => {
    // Only consider completed payments
    const completedPayments = payments.filter(payment => payment.status === "concluido");
    
    // Group payments by tripeiro
    const tripeirosMap = new Map<number, TripeiroSummary>();
    
    completedPayments.forEach(payment => {
      if (!payment.tripeiro || !payment.id_tripeiro) return;
      
      const tripeiroId = payment.id_tripeiro;
      const tripeiroName = payment.tripeiro.nome;
      const paymentAmount = Number(payment.valor);
      const tripeiroPercentage = payment.porcentagem_tripeiro || 0;
      const tripeiroPercentageDecimal = tripeiroPercentage / 100;
      const tripeiroCommission = paymentAmount * tripeiroPercentageDecimal;
      const tripeiroReceivable = paymentAmount - tripeiroCommission;
      
      if (tripeirosMap.has(tripeiroId)) {
        const existingSummary = tripeirosMap.get(tripeiroId)!;
        existingSummary.totalReceivable += tripeiroReceivable;
        existingSummary.paymentsCount += 1;
        // We don't need to update the percentage as it should be the same for all payments of this tripeiro
      } else {
        tripeirosMap.set(tripeiroId, {
          id: tripeiroId,
          nome: tripeiroName,
          totalReceivable: tripeiroReceivable,
          paymentsCount: 1,
          porcentagemDecimal: tripeiroPercentageDecimal
        });
      }
    });
    
    // Convert map to array and sort by total receivable (highest first)
    return Array.from(tripeirosMap.values())
      .sort((a, b) => b.totalReceivable - a.totalReceivable);
  };

  // Calculate attendant commissions
  const calculateAttendantSummaries = (payments: Payment[]): AttendantSummary[] => {
    // Only consider completed payments
    const completedPayments = payments.filter(payment => payment.status === "concluido");
    
    // Group payments by attendant
    const attendantsMap = new Map<number, AttendantSummary>();
    
    completedPayments.forEach(payment => {
      if (!payment.atendente || !payment.id_atendente) return;
      
      const attendantId = payment.id_atendente;
      const attendantName = payment.atendente.nome;
      const paymentAmount = Number(payment.valor);
      const tripeiroPercentage = payment.porcentagem_tripeiro || 0;
      const attendantPercentage = payment.porcentagem_atendente || 0;
      const attendantPercentageDecimal = attendantPercentage / 100;
      
      // Calculate attendant commission (after tripeiro's commission is removed)
      const tripeiroCommission = paymentAmount * (tripeiroPercentage / 100);
      const tripeiroReceivable = paymentAmount - tripeiroCommission;
      const attendantCommission = tripeiroReceivable * attendantPercentageDecimal;
      
      if (attendantsMap.has(attendantId)) {
        const existingSummary = attendantsMap.get(attendantId)!;
        existingSummary.totalCommission += attendantCommission;
        existingSummary.paymentsCount += 1;
        // We don't need to update the percentage as it should be the same for all payments of this attendant
      } else {
        attendantsMap.set(attendantId, {
          id: attendantId,
          nome: attendantName,
          totalCommission: attendantCommission,
          paymentsCount: 1,
          porcentagemDecimal: attendantPercentageDecimal
        });
      }
    });
    
    // Convert map to array and sort by total commission (highest first)
    return Array.from(attendantsMap.values())
      .sort((a, b) => b.totalCommission - a.totalCommission);
  };

  return {
    calculateClosingSummary,
    calculateTripeiroSummaries,
    calculateAttendantSummaries
  };
}

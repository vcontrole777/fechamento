
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
  totalPaymentAmount: number; // Total original payment amount
  paymentsCount: number;
  porcentagemDecimal: number; // Add percentage as decimal
  totalReferralCommission: number; // Commission earned from referrals
  referralDetails?: Array<{ // Details of referred attendants
    nome: string;
    commission: number;
    paymentsCount: number;
  }>;
};

export type ClosingSummary = {
  totalRevenue: number;
  totalExpenses: number;
  totalAttendantCommission: number;
  totalTripeiroCommission: number;
  totalReferralCommission: number;
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
        // Use the percentage that was saved at the time of payment creation
        const tripeiroPercentage = payment.porcentagem_tripeiro;
        const atendentePercentage = payment.porcentagem_atendente;
        
        const tripeiroCommission = totalPayment * (tripeiroPercentage / 100);
        const tripeiroReceivable = totalPayment - tripeiroCommission;
        const atendenteCommissionTotal = tripeiroReceivable * (atendentePercentage / 100);
        
        // Calculate referral commission if attendant was referred
        const referralPercentage = (payment.atendente as any)?.porcentagem_indicacao || 0;
        const referralCommission = atendenteCommissionTotal * (referralPercentage / 100);
        
        // Attendant receives commission MINUS referral
        const atendenteCommission = atendenteCommissionTotal - referralCommission;
        
        return {
          tripeiro: acc.tripeiro + tripeiroCommission,
          atendente: acc.atendente + atendenteCommission,
          referral: acc.referral + referralCommission
        };
      },
      { tripeiro: 0, atendente: 0, referral: 0 }
    );
    
    // Calculate net profit
    const netProfit = totalRevenue - commissions.tripeiro - commissions.atendente - commissions.referral - totalExpenses;
    
    return {
      totalRevenue,
      totalExpenses,
      totalAttendantCommission: commissions.atendente,
      totalTripeiroCommission: commissions.tripeiro,
      totalReferralCommission: commissions.referral,
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
      // Use the most current percentage from tripeiro
      const tripeiroPercentage = payment.tripeiro.porcentagem || payment.porcentagem_tripeiro;
      const tripeiroPercentageDecimal = tripeiroPercentage / 100;
      const tripeiroCommission = paymentAmount * tripeiroPercentageDecimal;
      const tripeiroReceivable = paymentAmount - tripeiroCommission;
      
      if (tripeirosMap.has(tripeiroId)) {
        const existingSummary = tripeirosMap.get(tripeiroId)!;
        existingSummary.totalReceivable += tripeiroReceivable;
        existingSummary.paymentsCount += 1;
        // Update the percentage to the latest one
        existingSummary.porcentagemDecimal = tripeiroPercentageDecimal;
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
  const calculateAttendantSummaries = (payments: Payment[], attendants: any[] = []): AttendantSummary[] => {
    // Only consider completed payments
    const completedPayments = payments.filter(payment => payment.status === "concluido");
    
    // Group payments by attendant
    const attendantsMap = new Map<number, AttendantSummary>();
    
    // First pass: calculate own commissions
    completedPayments.forEach(payment => {
      if (!payment.atendente || !payment.id_atendente) return;
      
      const attendantId = payment.id_atendente;
      const attendantName = payment.atendente.nome;
      const paymentAmount = Number(payment.valor);
      // Use the percentage that was saved at the time of payment creation
      const tripeiroPercentage = payment.porcentagem_tripeiro;
      const attendantPercentage = payment.porcentagem_atendente;
      const attendantPercentageDecimal = attendantPercentage / 100;
      
      // Calculate attendant commission (after tripeiro's commission is removed)
      const tripeiroCommission = paymentAmount * (tripeiroPercentage / 100);
      const tripeiroReceivable = paymentAmount - tripeiroCommission;
      const attendantCommissionTotal = tripeiroReceivable * attendantPercentageDecimal;
      
      // Check if this attendant was referred
      const porcentagemIndicacao = (payment.atendente as any)?.porcentagem_indicacao || 0;
      const referralCommission = porcentagemIndicacao > 0 
        ? attendantCommissionTotal * (porcentagemIndicacao / 100) 
        : 0;
      
      // Attendant receives commission MINUS referral
      const attendantCommission = attendantCommissionTotal - referralCommission;
      
      if (attendantsMap.has(attendantId)) {
        const existingSummary = attendantsMap.get(attendantId)!;
        existingSummary.totalCommission += attendantCommission;
        existingSummary.totalPaymentAmount += paymentAmount;
        existingSummary.paymentsCount += 1;
        // Update the percentage to the latest one
        existingSummary.porcentagemDecimal = attendantPercentageDecimal;
      } else {
        attendantsMap.set(attendantId, {
          id: attendantId,
          nome: attendantName,
          totalCommission: attendantCommission,
          totalPaymentAmount: paymentAmount,
          paymentsCount: 1,
          porcentagemDecimal: attendantPercentageDecimal,
          totalReferralCommission: 0,
          referralDetails: []
        });
      }
    });
    
    // Second pass: calculate referral commissions
    const referralMap = new Map<number, Map<string, { commission: number; count: number }>>();
    
    completedPayments.forEach(payment => {
      if (!payment.atendente || !payment.id_atendente) return;
      
      const idIndicador = (payment.atendente as any).id_indicador;
      const porcentagemIndicacao = (payment.atendente as any).porcentagem_indicacao || 0;
      
      console.log("Checking referral for payment:", {
        attendantName: payment.atendente.nome,
        idIndicador,
        porcentagemIndicacao,
        attendant: payment.atendente
      });
      
      if (!idIndicador || porcentagemIndicacao === 0) return;
      
      const paymentAmount = Number(payment.valor);
      const tripeiroPercentage = payment.porcentagem_tripeiro;
      const attendantPercentage = payment.porcentagem_atendente;
      
      // Calculate the referred attendant's TOTAL commission first (before deduction)
      const tripeiroCommission = paymentAmount * (tripeiroPercentage / 100);
      const tripeiroReceivable = paymentAmount - tripeiroCommission;
      const attendantCommissionTotal = tripeiroReceivable * (attendantPercentage / 100);
      
      // Calculate referral commission (what goes to the referrer)
      const referralCommission = attendantCommissionTotal * (porcentagemIndicacao / 100);
      
      console.log("Calculating referral commission:", {
        paymentAmount,
        tripeiroReceivable,
        attendantCommissionTotal,
        referralCommission,
        porcentagemIndicacao
      });
      
      // Add to referrer's total - CREATE entry if doesn't exist
      if (!attendantsMap.has(idIndicador)) {
        // Find referrer's name from attendants list or existing payments
        let referrerName = `Atendente ${idIndicador}`;
        let referrerPercentage = 0;
        
        // Try to find in attendants list first
        const referrer = attendants.find((a: any) => a.id === idIndicador);
        if (referrer) {
          referrerName = referrer.nome;
          referrerPercentage = referrer.porcentagem || 0;
        } else {
          // Fallback: find in existing payments
          const referrerPayment = completedPayments.find(p => p.id_atendente === idIndicador);
          if (referrerPayment?.atendente) {
            referrerName = referrerPayment.atendente.nome;
            referrerPercentage = referrerPayment.atendente.porcentagem || 0;
          }
        }
        
        console.log("Creating new entry for referrer:", { idIndicador, referrerName });
        
        attendantsMap.set(idIndicador, {
          id: idIndicador,
          nome: referrerName,
          totalCommission: 0,
          totalPaymentAmount: 0,
          paymentsCount: 0,
          porcentagemDecimal: referrerPercentage / 100,
          totalReferralCommission: 0,
          referralDetails: []
        });
      }
      
      const referrerSummary = attendantsMap.get(idIndicador)!;
      referrerSummary.totalReferralCommission += referralCommission;
      
      // Track referral details
      if (!referralMap.has(idIndicador)) {
        referralMap.set(idIndicador, new Map());
      }
      const referrerDetails = referralMap.get(idIndicador)!;
      const referredName = payment.atendente.nome;
      
      if (referrerDetails.has(referredName)) {
        const existing = referrerDetails.get(referredName)!;
        existing.commission += referralCommission;
        existing.count += 1;
      } else {
        referrerDetails.set(referredName, { commission: referralCommission, count: 1 });
      }
    });
    
    // Add referral details to summaries
    referralMap.forEach((details, attendantId) => {
      const summary = attendantsMap.get(attendantId);
      if (summary) {
        summary.referralDetails = Array.from(details.entries()).map(([nome, data]) => ({
          nome,
          commission: data.commission,
          paymentsCount: data.count
        }));
      }
    });
    
    // Convert map to array and sort by total commission (own + referral, highest first)
    return Array.from(attendantsMap.values())
      .sort((a, b) => (b.totalCommission + b.totalReferralCommission) - (a.totalCommission + a.totalReferralCommission));
  };

  return {
    calculateClosingSummary,
    calculateTripeiroSummaries,
    calculateAttendantSummaries
  };
}

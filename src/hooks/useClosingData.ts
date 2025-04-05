
import { useState } from "react";
import { DateRange } from "@/types/payment.types";
import { startOfDay, endOfDay, format } from "date-fns";
import { usePaymentsQuery } from "./payments/usePaymentsQuery";
import { useExpensesQuery } from "./useDashboardQueries";
import { Payment } from "@/types/payment.types";

export type TripeiroSummary = {
  id: number;
  nome: string;
  totalReceivable: number;
  paymentsCount: number;
};

export type AttendantSummary = {
  id: number;
  nome: string;
  totalCommission: number;
  paymentsCount: number;
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

export function useClosingData() {
  const today = new Date();
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(today),
    to: endOfDay(today)
  });

  // Fetch payments and expenses data using the existing query hooks
  const { data: payments, isLoading: isLoadingPayments } = usePaymentsQuery(
    { attendantIds: [], tripeiroIds: [], statuses: ["concluido"] },
    dateRange
  );
  
  const { data: expenses, isLoading: isLoadingExpenses } = useExpensesQuery(dateRange);

  // Calculate summary data
  const closingSummary = calculateClosingSummary(payments || [], expenses || []);
  
  // Calculate tripeiro receivables
  const tripeiroSummaries = calculateTripeiroSummaries(payments || []);
  
  // Calculate attendant commissions
  const attendantSummaries = calculateAttendantSummaries(payments || []);

  const updateDateRange = (range: DateRange) => {
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
    console.log("Updating closing date range:", {
      from: newRange.from ? format(newRange.from, 'yyyy-MM-dd') : null,
      to: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : null
    });
    
    setDateRange(newRange);
  };

  return {
    isLoading: isLoadingPayments || isLoadingExpenses,
    closingSummary,
    tripeiroSummaries,
    attendantSummaries,
    dateRange,
    updateDateRange,
  };
}

// Calculate the closing summary
function calculateClosingSummary(payments: Payment[], expenses: any[]): ClosingSummary {
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
}

// Calculate tripeiro receivables
function calculateTripeiroSummaries(payments: Payment[]): TripeiroSummary[] {
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
    const tripeiroCommission = paymentAmount * (tripeiroPercentage / 100);
    const tripeiroReceivable = paymentAmount - tripeiroCommission;
    
    if (tripeirosMap.has(tripeiroId)) {
      const existingSummary = tripeirosMap.get(tripeiroId)!;
      existingSummary.totalReceivable += tripeiroReceivable;
      existingSummary.paymentsCount += 1;
    } else {
      tripeirosMap.set(tripeiroId, {
        id: tripeiroId,
        nome: tripeiroName,
        totalReceivable: tripeiroReceivable,
        paymentsCount: 1
      });
    }
  });
  
  // Convert map to array and sort by total receivable (highest first)
  return Array.from(tripeirosMap.values())
    .sort((a, b) => b.totalReceivable - a.totalReceivable);
}

// Calculate attendant commissions
function calculateAttendantSummaries(payments: Payment[]): AttendantSummary[] {
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
    
    // Calculate attendant commission (after tripeiro's commission is removed)
    const tripeiroCommission = paymentAmount * (tripeiroPercentage / 100);
    const tripeiroReceivable = paymentAmount - tripeiroCommission;
    const attendantCommission = tripeiroReceivable * (attendantPercentage / 100);
    
    if (attendantsMap.has(attendantId)) {
      const existingSummary = attendantsMap.get(attendantId)!;
      existingSummary.totalCommission += attendantCommission;
      existingSummary.paymentsCount += 1;
    } else {
      attendantsMap.set(attendantId, {
        id: attendantId,
        nome: attendantName,
        totalCommission: attendantCommission,
        paymentsCount: 1
      });
    }
  });
  
  // Convert map to array and sort by total commission (highest first)
  return Array.from(attendantsMap.values())
    .sort((a, b) => b.totalCommission - a.totalCommission);
}

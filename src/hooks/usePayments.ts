
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { DateRange } from "@/components/common/DateFilter";
import { format, startOfDay, endOfDay } from "date-fns";

export type Attendant = {
  id: number;
  nome: string;
  porcentagem: number;
};

export type Tripeiro = {
  id: number;
  nome: string;
  porcentagem: number;
};

export type Payment = {
  id: number;
  data: string;
  valor: number;
  tipo: "boleto" | "pix";
  status: "concluido" | "pendente" | "bloqueado";
  id_atendente: number | null;
  id_tripeiro: number | null;
  porcentagem_atendente: number;
  porcentagem_tripeiro: number;
  criado_em: string;
  id_equipe: number;
  atendente?: {
    nome: string;
    porcentagem: number;
  };
  tripeiro?: {
    nome: string;
    porcentagem: number;
  };
};

export type PaymentFilters = {
  attendantIds: number[];
  tripeiroIds: number[];
  statuses: ("concluido" | "pendente" | "bloqueado")[];
};

export function usePayments() {
  const [isAddingPayment, setIsAddingPayment] = useState(false);
  const [isEditingPayment, setIsEditingPayment] = useState(false);
  const [isDeletingPayment, setIsDeletingPayment] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null);
  const [filters, setFilters] = useState<PaymentFilters>({
    attendantIds: [],
    tripeiroIds: [],
    statuses: [],
  });
  const [dateRange, setDateRange] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date())
  });

  const { data: payments, isLoading, refetch } = useQuery({
    queryKey: ["payments", filters, dateRange],
    queryFn: async () => {
      // Format dates properly for database query (YYYY-MM-DD)
      const fromDate = dateRange.from ? format(dateRange.from, 'yyyy-MM-dd') : null;
      const toDate = dateRange.to ? format(dateRange.to, 'yyyy-MM-dd') : null;
      
      console.log("Fetching payments with date range:", {
        from: fromDate,
        to: toDate
      });
      
      let query = supabase
        .from("pagamentos")
        .select(`
          *,
          atendente:pessoas!pagamentos_id_atendente_fkey(nome, porcentagem),
          tripeiro:pessoas!pagamentos_id_tripeiro_fkey(nome, porcentagem)
        `);

      // Apply filters
      if (filters.attendantIds.length > 0) {
        query = query.in("id_atendente", filters.attendantIds);
      }
      
      if (filters.tripeiroIds.length > 0) {
        query = query.in("id_tripeiro", filters.tripeiroIds);
      }
      
      if (filters.statuses.length > 0) {
        query = query.in("status", filters.statuses);
      }
      
      // Apply date range filter with exact date matching
      if (fromDate) {
        console.log("Filtering payments from date:", fromDate);
        query = query.gte('data', fromDate);
      }
      
      if (toDate) {
        console.log("Filtering payments to date:", toDate);
        query = query.lte('data', toDate);
      }

      query = query.order("data", { ascending: false });

      const { data, error } = await query;

      if (error) {
        toast({
          title: "Erro ao carregar pagamentos",
          description: error.message,
          variant: "destructive",
        });
        return [];
      }

      return data as Payment[];
    },
  });

  const calculateTotals = () => {
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

  const { 
    totalPayments, 
    totalAttendantCommission, 
    totalTripeiroReceivable,
    netTotal
  } = calculateTotals();

  const openAddPaymentDialog = () => setIsAddingPayment(true);
  const closeAddPaymentDialog = () => setIsAddingPayment(false);
  
  const openEditPaymentDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsEditingPayment(true);
  };
  const closeEditPaymentDialog = () => {
    setSelectedPayment(null);
    setIsEditingPayment(false);
  };
  
  const openDeletePaymentDialog = (payment: Payment) => {
    setSelectedPayment(payment);
    setIsDeletingPayment(true);
  };
  const closeDeletePaymentDialog = () => {
    setSelectedPayment(null);
    setIsDeletingPayment(false);
  };

  const updateFilters = (newFilters: Partial<PaymentFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  const updateDateRange = (range: DateRange) => {
    // Make sure we're using startOfDay and endOfDay correctly
    const newRange: DateRange = {
      from: range.from ? startOfDay(range.from) : null,
      to: range.to ? endOfDay(range.to) : null
    };
    
    console.log("Updating date range in usePayments:", {
      from: newRange.from ? format(newRange.from, 'yyyy-MM-dd') : null,
      to: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : null
    });
    
    setDateRange(newRange);
  };

  return {
    payments,
    isLoading,
    totalPayments,
    totalAttendantCommission,
    totalTripeiroReceivable,
    netTotal,
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
  };
}

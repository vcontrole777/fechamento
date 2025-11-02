import { useState } from "react";
import { TripeiroPayment } from "@/types/tripeiroPayment.types";

export function useTripeiroPayments() {
  const [selectedTripeiro, setSelectedTripeiro] = useState<{
    id: number;
    nome: string;
    valorAReceber: number;
    periodoInicio: string;
    periodoFim: string;
  } | null>(null);
  const [isRegisterDialogOpen, setIsRegisterDialogOpen] = useState(false);
  const [isHistoryDialogOpen, setIsHistoryDialogOpen] = useState(false);
  const [selectedPayment, setSelectedPayment] = useState<TripeiroPayment | null>(null);

  const openRegisterDialog = (tripeiro: {
    id: number;
    nome: string;
    valorAReceber: number;
    periodoInicio: string;
    periodoFim: string;
  }) => {
    setSelectedTripeiro(tripeiro);
    setIsRegisterDialogOpen(true);
  };

  const closeRegisterDialog = () => {
    setIsRegisterDialogOpen(false);
    setSelectedTripeiro(null);
  };

  const openHistoryDialog = (tripeiro: {
    id: number;
    nome: string;
    valorAReceber: number;
    periodoInicio: string;
    periodoFim: string;
  }) => {
    setSelectedTripeiro(tripeiro);
    setIsHistoryDialogOpen(true);
  };

  const closeHistoryDialog = () => {
    setIsHistoryDialogOpen(false);
    setSelectedTripeiro(null);
    setSelectedPayment(null);
  };

  return {
    selectedTripeiro,
    isRegisterDialogOpen,
    isHistoryDialogOpen,
    selectedPayment,
    setSelectedPayment,
    openRegisterDialog,
    closeRegisterDialog,
    openHistoryDialog,
    closeHistoryDialog,
  };
}

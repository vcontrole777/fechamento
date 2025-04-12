
import { useMemo } from "react";

interface CalculationPreviewProps {
  totalValue: number;
  tripeiroPercentage: number;
  attendantPercentage: number;
  useCustomTripeiroPercentage: boolean;
  selectedTripeiroPercentage: number;
}

export function CalculationPreview({
  totalValue,
  tripeiroPercentage,
  attendantPercentage,
  useCustomTripeiroPercentage,
  selectedTripeiroPercentage,
}: CalculationPreviewProps) {
  const calculations = useMemo(() => {
    if (!totalValue) return null;

    // Determine which percentage to use based on the toggle
    const effectiveTripeiroPercentage = useCustomTripeiroPercentage 
      ? tripeiroPercentage 
      : selectedTripeiroPercentage;

    const tripeiroCommission = totalValue * (effectiveTripeiroPercentage / 100);
    const tripeiroReceivable = totalValue - tripeiroCommission;
    const attendantCommission = tripeiroReceivable * (attendantPercentage / 100);
    const netValue = totalValue - tripeiroCommission - attendantCommission;

    return {
      tripeiroCommission,
      tripeiroReceivable,
      attendantCommission,
      netValue,
    };
  }, [totalValue, tripeiroPercentage, attendantPercentage, useCustomTripeiroPercentage, selectedTripeiroPercentage]);

  if (!totalValue || !calculations) return null;

  // Determine which percentage to display in the UI
  const displayTripeiroPercentage = useCustomTripeiroPercentage 
    ? tripeiroPercentage 
    : selectedTripeiroPercentage;

  return (
    <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
      <h3 className="font-semibold text-sm">Prévia do Cálculo:</h3>
      <div className="grid grid-cols-2 text-sm">
        <div>Comissão Tripeiro ({displayTripeiroPercentage}%):</div>
        <div>R$ {calculations.tripeiroCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
      <div className="grid grid-cols-2 text-sm">
        <div>Valor a Receber do Tripeiro:</div>
        <div>R$ {calculations.tripeiroReceivable.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
      <div className="grid grid-cols-2 text-sm">
        <div>Comissão Atendente ({attendantPercentage}%):</div>
        <div>R$ {calculations.attendantCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
      <div className="grid grid-cols-2 text-sm font-semibold">
        <div>Valor Líquido:</div>
        <div>R$ {calculations.netValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
    </div>
  );
}

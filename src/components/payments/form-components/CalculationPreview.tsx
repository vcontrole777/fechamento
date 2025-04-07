
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

    const tripeiroCommission = totalValue * (tripeiroPercentage / 100);
    const tripeiroReceivable = totalValue - tripeiroCommission;
    const attendantCommission = tripeiroReceivable * (attendantPercentage / 100);
    const netValue = totalValue - tripeiroCommission - attendantCommission;

    return {
      tripeiroCommission,
      tripeiroReceivable,
      attendantCommission,
      netValue,
    };
  }, [totalValue, tripeiroPercentage, attendantPercentage]);

  if (!totalValue || !calculations) return null;

  return (
    <div className="mt-4 p-4 bg-muted rounded-md space-y-2">
      <h3 className="font-semibold text-sm">Prévia do Cálculo:</h3>
      <div className="grid grid-cols-2 text-sm">
        <div>Comissão Tripeiro ({useCustomTripeiroPercentage ? tripeiroPercentage : selectedTripeiroPercentage}%):</div>
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

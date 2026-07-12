
import { useMemo } from "react";
import { splitCommissionCore } from "@/utils/commission";
import { formatCurrency } from "@/utils/currency";

interface CalculationPreviewProps {
  totalValue: number;
  tripeiroPercentage: number;
  attendantPercentage: number;
  useCustomTripeiroPercentage: boolean;
  selectedTripeiroPercentage: number;
  referrerName?: string;
  referralPercentage?: number;
}

export function CalculationPreview({
  totalValue,
  tripeiroPercentage,
  attendantPercentage,
  useCustomTripeiroPercentage,
  selectedTripeiroPercentage,
  referrerName,
  referralPercentage,
}: CalculationPreviewProps) {
  const calculations = useMemo(() => {
    if (!totalValue) return null;

    // Determine which percentage to use based on the toggle
    const effectiveTripeiroPercentage = useCustomTripeiroPercentage
      ? tripeiroPercentage
      : selectedTripeiroPercentage;

    return splitCommissionCore(totalValue, effectiveTripeiroPercentage, attendantPercentage, referralPercentage || 0);
  }, [totalValue, tripeiroPercentage, attendantPercentage, useCustomTripeiroPercentage, selectedTripeiroPercentage, referralPercentage]);

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
        <div>{formatCurrency(calculations.tripeiroCommission)}</div>
      </div>
      <div className="grid grid-cols-2 text-sm">
        <div>Valor a Receber do Tripeiro:</div>
        <div>{formatCurrency(calculations.tripeiroReceivable)}</div>
      </div>
      <div className="grid grid-cols-2 text-sm">
        <div>Comissão Atendente Líquida ({attendantPercentage}%):</div>
        <div>{formatCurrency(calculations.attendantCommission)}</div>
      </div>
      {referrerName && referralPercentage && referralPercentage > 0 && (
        <div className="grid grid-cols-2 text-sm text-amber-600 dark:text-amber-400">
          <div>Comissão de Indicação ({referrerName} - {referralPercentage}%):</div>
          <div>{formatCurrency(calculations.referralCommission)}</div>
        </div>
      )}
      <div className="grid grid-cols-2 text-sm font-semibold">
        <div>Valor Líquido:</div>
        <div>{formatCurrency(calculations.netValue)}</div>
      </div>
    </div>
  );
}


import { useMemo } from "react";

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

    const tripeiroCommission = totalValue * (effectiveTripeiroPercentage / 100);
    const tripeiroReceivable = totalValue - tripeiroCommission;
    const attendantCommission = tripeiroReceivable * (attendantPercentage / 100);
    
    // Calculate referral commission if applicable
    const referralCommission = (referralPercentage && referralPercentage > 0)
      ? attendantCommission * (referralPercentage / 100)
      : 0;
    
    const netValue = totalValue - tripeiroCommission - attendantCommission - referralCommission;

    return {
      tripeiroCommission,
      tripeiroReceivable,
      attendantCommission,
      referralCommission,
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
      {referrerName && referralPercentage && referralPercentage > 0 && (
        <div className="grid grid-cols-2 text-sm text-amber-600 dark:text-amber-400">
          <div>Comissão de Indicação ({referrerName} - {referralPercentage}%):</div>
          <div>R$ {calculations.referralCommission.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
        </div>
      )}
      <div className="grid grid-cols-2 text-sm font-semibold">
        <div>Valor Líquido:</div>
        <div>R$ {calculations.netValue.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</div>
      </div>
    </div>
  );
}

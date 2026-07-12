import { Payment } from "@/types/payment.types";

export type CommissionSplit = {
  tripeiroCommission: number;
  tripeiroReceivable: number;
  attendantPool: number;
  attendantCommission: number;
  referralCommission: number;
  netValue: number;
};

export function splitCommissionCore(
  valor: number,
  pctTripeiro: number,
  pctAtendente: number,
  pctIndicacao: number = 0
): CommissionSplit {
  const tripeiroCommission = valor * (pctTripeiro / 100);
  const tripeiroReceivable = valor - tripeiroCommission;
  const attendantPool = tripeiroReceivable * (pctAtendente / 100);

  const referralCommission = pctIndicacao > 0 ? attendantPool * (pctIndicacao / 100) : 0;
  const attendantCommission = attendantPool - referralCommission;

  const netValue = valor - tripeiroCommission - attendantCommission - referralCommission;

  return {
    tripeiroCommission,
    tripeiroReceivable,
    attendantPool,
    attendantCommission,
    referralCommission,
    netValue,
  };
}

export function splitCommission(payment: Payment): CommissionSplit {
  return splitCommissionCore(
    Number(payment.valor),
    payment.porcentagem_tripeiro,
    payment.porcentagem_atendente,
    payment.porcentagem_indicacao ?? 0
  );
}

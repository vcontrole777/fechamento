export type WorkerType = "atendente" | "tripeiro";

const PAYMENT_TABLE: Record<WorkerType, "pagamentos_atendentes" | "pagamentos_tripeiros"> = {
  atendente: "pagamentos_atendentes",
  tripeiro: "pagamentos_tripeiros",
};

const WORKER_ID_COLUMN: Record<WorkerType, "id_atendente" | "id_tripeiro"> = {
  atendente: "id_atendente",
  tripeiro: "id_tripeiro",
};

export function paymentTableFor(tipo: WorkerType) {
  return PAYMENT_TABLE[tipo];
}

export function workerIdColumnFor(tipo: WorkerType) {
  return WORKER_ID_COLUMN[tipo];
}

export function derivePaymentStatus(
  valorPago: number,
  valorDevido: number
): "pendente" | "pago_parcial" | "pago_total" {
  if (valorPago <= 0) return "pendente";
  if (valorPago < valorDevido) return "pago_parcial";
  return "pago_total";
}

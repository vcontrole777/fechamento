
import { Payment } from "@/types/payment.types";

export type ReceiptFormValues = {
  amount: string;
  receiptDate: Date;
};

export type TripeiroRecebimento = {
  id: number;
  id_tripeiro: number;
  valor: number;
  data_recebimento: string;
  criado_em: string;
};

export type TripeiroWithPayments = {
  id: number;
  nome: string;
  porcentagem: number;
  payments: Payment[];
  receipts: TripeiroRecebimento[];
  totalPayments: number;
  totalReceivable: number;
  completedAmount: number;
  receivedAmount: number;
  totalReceived: number;
};

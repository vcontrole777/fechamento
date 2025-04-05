
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

export type DateRange = {
  from: Date | null;
  to: Date | null;
};

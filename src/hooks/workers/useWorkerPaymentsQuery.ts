import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { DateRange } from "@/components/common/date-filter/types";
import { useEffectiveTeamId } from "@/hooks/useEffectiveTeamId";
import { WorkerType, paymentTableFor, workerIdColumnFor } from "./workerConfig";
import { WorkerPayment } from "@/types/workerPayment.types";

type RawWorkerPaymentRow = {
  id: string;
  id_equipe: number;
  id_atendente?: number;
  id_tripeiro?: number;
  valor_devido: number;
  valor_pago: number;
  data_pagamento: string;
  periodo_inicio: string;
  periodo_fim: string;
  metodo_pagamento: WorkerPayment["metodo_pagamento"];
  observacoes: string | null;
  status: WorkerPayment["status"];
  criado_em: string;
  atualizado_em: string;
  criado_por: string | null;
};

function mapRow(tipo: WorkerType, row: RawWorkerPaymentRow): WorkerPayment {
  return {
    id: row.id,
    id_equipe: row.id_equipe,
    workerId: row[workerIdColumnFor(tipo)] as number,
    valor_devido: row.valor_devido,
    valor_pago: row.valor_pago,
    data_pagamento: row.data_pagamento,
    periodo_inicio: row.periodo_inicio,
    periodo_fim: row.periodo_fim,
    metodo_pagamento: row.metodo_pagamento,
    observacoes: row.observacoes,
    status: row.status,
    criado_em: row.criado_em,
    atualizado_em: row.atualizado_em,
    criado_por: row.criado_por,
  };
}

// Busca todos os pagamentos de um tipo de trabalhador que se sobrepoem ao
// periodo selecionado. Consumido tanto pela tela de fechamento (todas as
// pessoas do tipo) quanto filtrado no cliente para um trabalhador especifico.
export function useWorkerPaymentsQuery(tipo: WorkerType, dateRange: DateRange) {
  const teamId = useEffectiveTeamId();

  return useQuery({
    queryKey: ["worker-payments", tipo, dateRange.from, dateRange.to, teamId],
    queryFn: async (): Promise<WorkerPayment[]> => {
      if (!dateRange.from || !dateRange.to) return [];

      const rangeStart = format(dateRange.from, "yyyy-MM-dd");
      const rangeEnd = format(dateRange.to, "yyyy-MM-dd");

      let query = supabase
        .from(paymentTableFor(tipo))
        .select("*")
        .lte("periodo_inicio", rangeEnd)
        .gte("periodo_fim", rangeStart);

      if (teamId !== null) {
        query = query.eq("id_equipe", teamId);
      }

      const { data, error } = await query.order("data_pagamento", { ascending: false });

      if (error) {
        toast({
          title: "Erro ao carregar pagamentos",
          description: error.message,
          variant: "destructive",
        });
        throw error;
      }

      return (data || []).map(row => mapRow(tipo, row));
    },
    enabled: !!teamId && !!dateRange.from && !!dateRange.to,
  });
}

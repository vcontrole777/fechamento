
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Recebimento } from "@/types/recebimento.types";
import { DollarSign, Users, TrendingUp } from "lucide-react";

interface RecebimentosStatsProps {
  recebimentos: Recebimento[];
}

export function RecebimentosStats({ recebimentos }: RecebimentosStatsProps) {
  const totalRecebido = recebimentos.reduce((sum, recebimento) => 
    sum + Number(recebimento.valor), 0
  );

  const tripeirosUnicos = new Set(recebimentos.map(r => r.id_tripeiro)).size;
  
  const mediaRecebimento = recebimentos.length > 0 ? totalRecebido / recebimentos.length : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalRecebido)}
          </div>
          <p className="text-xs text-muted-foreground">
            {recebimentos.length} recebimento{recebimentos.length !== 1 ? 's' : ''}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Tripeiros Ativos</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{tripeirosUnicos}</div>
          <p className="text-xs text-muted-foreground">
            Com recebimentos no período
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Média por Recebimento</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(mediaRecebimento)}
          </div>
          <p className="text-xs text-muted-foreground">
            Valor médio recebido
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

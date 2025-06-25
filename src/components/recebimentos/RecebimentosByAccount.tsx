
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Recebimento } from "@/types/recebimento.types";
import { RecebimentosTable } from "./RecebimentosTable";
import { Building2, CreditCard, Calendar } from "lucide-react";

interface RecebimentosByAccountProps {
  recebimentos: Recebimento[];
  onEdit: (recebimento: Recebimento) => void;
  onDelete: (recebimento: Recebimento) => void;
}

export function RecebimentosByAccount({ 
  recebimentos, 
  onEdit, 
  onDelete 
}: RecebimentosByAccountProps) {
  // Agrupar recebimentos por conta e banco
  const groupedRecebimentos = recebimentos.reduce((groups, recebimento) => {
    const key = `${recebimento.banco || 'Sem banco'} - ${recebimento.conta_depositada || 'Sem conta'}`;
    if (!groups[key]) {
      groups[key] = {
        banco: recebimento.banco,
        conta: recebimento.conta_depositada,
        recebimentos: [],
        total: 0
      };
    }
    groups[key].recebimentos.push(recebimento);
    groups[key].total += Number(recebimento.valor);
    return groups;
  }, {} as Record<string, {
    banco?: string;
    conta?: string;
    recebimentos: Recebimento[];
    total: number;
  }>);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  if (Object.keys(groupedRecebimentos).length === 0) {
    return <div className="text-center text-gray-500 py-8">Nenhum recebimento encontrado</div>;
  }

  return (
    <div className="space-y-6">
      {Object.entries(groupedRecebimentos).map(([key, group]) => (
        <Card key={key}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  {group.banco || 'Banco não informado'}
                </CardTitle>
                {group.conta && (
                  <div className="flex items-center gap-1 text-sm text-gray-600">
                    <CreditCard className="h-4 w-4" />
                    Conta: {group.conta}
                  </div>
                )}
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {group.recebimentos.length} depósito(s)
                </Badge>
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Total: {formatCurrency(group.total)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <RecebimentosTable
              recebimentos={group.recebimentos}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          </CardContent>
        </Card>
      ))}
    </div>
  );
}

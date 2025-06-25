
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit, Trash2, CreditCard, Building2 } from "lucide-react";
import { Recebimento } from "@/types/recebimento.types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface RecebimentosTableProps {
  recebimentos: Recebimento[];
  onEdit: (recebimento: Recebimento) => void;
  onDelete: (recebimento: Recebimento) => void;
}

export function RecebimentosTable({ recebimentos, onEdit, onDelete }: RecebimentosTableProps) {
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getTipoDepositoBadgeColor = (tipo?: string) => {
    switch (tipo) {
      case 'pix': return 'bg-green-100 text-green-800';
      case 'transferencia': return 'bg-blue-100 text-blue-800';
      case 'ted': return 'bg-purple-100 text-purple-800';
      case 'doc': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tripeiro</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Banco/Conta</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Comprovante</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recebimentos.map((recebimento) => (
            <TableRow key={recebimento.id}>
              <TableCell>
                {format(new Date(recebimento.data), "dd/MM/yyyy", { locale: ptBR })}
              </TableCell>
              <TableCell className="font-medium">
                {recebimento.tripeiro?.nome || "N/A"}
              </TableCell>
              <TableCell className="font-semibold text-green-600">
                {formatCurrency(Number(recebimento.valor))}
              </TableCell>
              <TableCell>
                {recebimento.banco || recebimento.conta_depositada ? (
                  <div className="flex flex-col space-y-1">
                    {recebimento.banco && (
                      <div className="flex items-center gap-1 text-sm">
                        <Building2 className="h-3 w-3" />
                        {recebimento.banco}
                      </div>
                    )}
                    {recebimento.conta_depositada && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <CreditCard className="h-3 w-3" />
                        {recebimento.conta_depositada}
                      </div>
                    )}
                  </div>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {recebimento.tipo_deposito ? (
                  <Badge 
                    variant="secondary" 
                    className={getTipoDepositoBadgeColor(recebimento.tipo_deposito)}
                  >
                    {recebimento.tipo_deposito.toUpperCase()}
                  </Badge>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell className="font-mono text-sm">
                {recebimento.numero_comprovante || "-"}
              </TableCell>
              <TableCell className="max-w-[200px] truncate">
                {recebimento.observacoes || "-"}
              </TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onEdit(recebimento)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(recebimento)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}


import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit, Trash2 } from "lucide-react";
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

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tripeiro</TableHead>
            <TableHead>Valor</TableHead>
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


import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Recebimento } from "@/hooks/useRecebimentos";
import { EditRecebimentoDialog } from "./EditRecebimentoDialog";
import { DeleteRecebimentoDialog } from "./DeleteRecebimentoDialog";

interface RecebimentosTableProps {
  recebimentos: Recebimento[];
  formatCurrency: (value: number) => string;
}

export function RecebimentosTable({ recebimentos, formatCurrency }: RecebimentosTableProps) {
  const formatDate = (dateString: string) => {
    try {
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error);
      return dateString;
    }
  };

  const formatTipoDeposito = (tipo: string | null) => {
    if (!tipo) return "-";
    
    const tipos: { [key: string]: string } = {
      deposito: "Depósito",
      transferencia: "Transferência",
      pix: "PIX",
      ted: "TED",
    };
    
    return tipos[tipo] || tipo;
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Data</TableHead>
            <TableHead>Tripeiro</TableHead>
            <TableHead>Valor</TableHead>
            <TableHead>Banco</TableHead>
            <TableHead>Conta</TableHead>
            <TableHead>Tipo</TableHead>
            <TableHead>Comprovante</TableHead>
            <TableHead>Observações</TableHead>
            <TableHead className="w-20">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {recebimentos.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="h-24 text-center">
                Nenhum recebimento encontrado.
              </TableCell>
            </TableRow>
          ) : (
            recebimentos.map((recebimento) => (
              <TableRow key={recebimento.id}>
                <TableCell>{formatDate(recebimento.data)}</TableCell>
                <TableCell>{recebimento.tripeiro?.nome || "N/A"}</TableCell>
                <TableCell>{formatCurrency(Number(recebimento.valor))}</TableCell>
                <TableCell>{recebimento.banco || "-"}</TableCell>
                <TableCell>{recebimento.conta_depositada || "-"}</TableCell>
                <TableCell>{formatTipoDeposito(recebimento.tipo_deposito)}</TableCell>
                <TableCell>{recebimento.numero_comprovante || "-"}</TableCell>
                <TableCell className="max-w-[200px] truncate">
                  {recebimento.observacoes || "-"}
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    <EditRecebimentoDialog recebimento={recebimento} />
                    <DeleteRecebimentoDialog recebimento={recebimento} />
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}

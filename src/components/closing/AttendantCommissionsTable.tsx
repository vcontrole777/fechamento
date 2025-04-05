
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { AttendantSummary } from "@/hooks/useClosingData";

interface AttendantCommissionsTableProps {
  attendantSummaries: AttendantSummary[];
  formatCurrency: (value: number) => string;
}

export function AttendantCommissionsTable({ 
  attendantSummaries, 
  formatCurrency 
}: AttendantCommissionsTableProps) {
  if (attendantSummaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
        <p className="text-sm text-muted-foreground">
          Nenhuma comissão para atendentes no período selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableCaption>Comissões a pagar para atendentes no período</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Atendente</TableHead>
            <TableHead>Pagamentos</TableHead>
            <TableHead className="text-right">Comissão</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendantSummaries.map((attendant) => (
            <TableRow key={attendant.id}>
              <TableCell className="font-medium">{attendant.nome}</TableCell>
              <TableCell>{attendant.paymentsCount}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(attendant.totalCommission)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

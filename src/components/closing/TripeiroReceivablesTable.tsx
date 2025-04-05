
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { TripeiroSummary } from "@/hooks/useClosingData";

interface TripeiroReceivablesTableProps {
  tripeiroSummaries: TripeiroSummary[];
  formatCurrency: (value: number) => string;
}

export function TripeiroReceivablesTable({ 
  tripeiroSummaries, 
  formatCurrency 
}: TripeiroReceivablesTableProps) {
  if (tripeiroSummaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
        <p className="text-sm text-muted-foreground">
          Nenhum pagamento para tripeiros no período selecionado.
        </p>
      </div>
    );
  }

  return (
    <div className="border rounded-md">
      <Table>
        <TableCaption>Valores a pagar para tripeiros no período</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tripeiro</TableHead>
            <TableHead>Pagamentos</TableHead>
            <TableHead className="text-right">Valor a Receber</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tripeiroSummaries.map((tripeiro) => (
            <TableRow key={tripeiro.id}>
              <TableCell className="font-medium">{tripeiro.nome}</TableCell>
              <TableCell>{tripeiro.paymentsCount}</TableCell>
              <TableCell className="text-right font-medium">
                {formatCurrency(tripeiro.totalReceivable)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

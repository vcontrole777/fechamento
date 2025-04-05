
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter
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

  // Calculate total receivable for all tripeiros
  const totalReceivable = tripeiroSummaries.reduce((acc, tripeiro) => acc + tripeiro.totalReceivable, 0);
  const totalPayments = tripeiroSummaries.reduce((acc, tripeiro) => acc + tripeiro.paymentsCount, 0);

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
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className="font-bold">{totalPayments}</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(totalReceivable)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

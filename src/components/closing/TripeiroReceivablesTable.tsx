
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
import { useIsMobile } from "@/hooks/use-mobile";

interface TripeiroReceivablesTableProps {
  tripeiroSummaries: TripeiroSummary[];
  formatCurrency: (value: number) => string;
}

export function TripeiroReceivablesTable({ 
  tripeiroSummaries, 
  formatCurrency 
}: TripeiroReceivablesTableProps) {
  const isMobile = useIsMobile();

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
  
  // Calculate the total original payment value before tripeiro commission
  const totalOriginalPayment = tripeiroSummaries.reduce((acc, tripeiro) => {
    const originalPaymentValue = tripeiro.totalReceivable / (1 - tripeiro.porcentagemDecimal);
    return acc + originalPaymentValue;
  }, 0);

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableCaption>Valores a pagar para tripeiros no período</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Tripeiro</TableHead>
            <TableHead className={isMobile ? "hidden" : ""}>Pagamentos</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Valor a Receber</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tripeiroSummaries.map((tripeiro) => {
            // Calculate original payment value before tripeiro's commission
            const originalPaymentValue = tripeiro.totalReceivable / (1 - tripeiro.porcentagemDecimal);
            
            return (
              <TableRow key={tripeiro.id}>
                <TableCell className="font-medium">{tripeiro.nome}</TableCell>
                <TableCell className={isMobile ? "hidden" : ""}>{tripeiro.paymentsCount}</TableCell>
                <TableCell>{formatCurrency(originalPaymentValue)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(tripeiro.totalReceivable)}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className={`font-bold ${isMobile ? "hidden" : ""}`}>{totalPayments}</TableCell>
            <TableCell className="font-bold">{formatCurrency(totalOriginalPayment)}</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(totalReceivable)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

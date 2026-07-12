
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
import { Button } from "@/components/ui/button";
import { DollarSign, History } from "lucide-react";
import { TripeiroSummary } from "@/hooks/useClosingData";
import { useIsMobile } from "@/hooks/use-mobile";
import { TripeiroPaymentStatusBadge } from "./TripeiroPaymentStatusBadge";

interface TripeiroReceivablesTableProps {
  tripeiroSummaries: TripeiroSummary[];
  formatCurrency: (value: number) => string;
  onRegisterPayment: (tripeiroId: number) => void;
  onViewHistory: (tripeiroId: number) => void;
  getPaymentStatus: (tripeiroId: number, totalDue: number) => 'pendente' | 'pago_parcial' | 'pago_total';
  getTotalPaid: (tripeiroId: number) => number;
}

export function TripeiroReceivablesTable({ 
  tripeiroSummaries, 
  formatCurrency,
  onRegisterPayment,
  onViewHistory,
  getPaymentStatus,
  getTotalPaid,
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
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tripeiroSummaries.map((tripeiro) => {
            // Calculate original payment value before tripeiro's commission
            const originalPaymentValue = tripeiro.totalReceivable / (1 - tripeiro.porcentagemDecimal);
            const status = getPaymentStatus(tripeiro.id, tripeiro.totalReceivable);
            const totalPaid = getTotalPaid(tripeiro.id);
            
            return (
              <TableRow key={tripeiro.id}>
                <TableCell className="font-medium">{tripeiro.nome}</TableCell>
                <TableCell className={isMobile ? "hidden" : ""}>{tripeiro.paymentsCount}</TableCell>
                <TableCell>{formatCurrency(originalPaymentValue)}</TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(tripeiro.totalReceivable)}
                </TableCell>
                <TableCell className="text-center">
                  <TripeiroPaymentStatusBadge
                    status={status}
                    valorPago={totalPaid}
                    valorAReceber={tripeiro.totalReceivable}
                    formatCurrency={formatCurrency}
                  />
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex justify-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRegisterPayment(tripeiro.id)}
                      className="h-8 px-2"
                    >
                      <DollarSign className="h-4 w-4 mr-1" />
                      Registrar
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewHistory(tripeiro.id)}
                      className="h-8 px-2"
                    >
                      <History className="h-4 w-4 mr-1" />
                      Histórico
                    </Button>
                  </div>
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
            <TableCell colSpan={2}></TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

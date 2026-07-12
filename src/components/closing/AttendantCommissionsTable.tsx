
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
import { AttendantSummary } from "@/hooks/useClosingData";
import { useIsMobile } from "@/hooks/use-mobile";
import { AttendantPaymentStatusBadge } from "./AttendantPaymentStatusBadge";
import { DollarSign, History } from "lucide-react";

interface AttendantCommissionsTableProps {
  attendantSummaries: AttendantSummary[];
  formatCurrency: (value: number) => string;
  onRegisterPayment?: (attendantId: number) => void;
  onViewHistory?: (attendantId: number) => void;
  getPaymentStatus?: (attendantId: number, totalCommission: number) => 'pendente' | 'pago_parcial' | 'pago_total';
  getTotalPaid?: (attendantId: number) => number;
}

export function AttendantCommissionsTable({ 
  attendantSummaries, 
  formatCurrency,
  onRegisterPayment,
  onViewHistory,
  getPaymentStatus,
  getTotalPaid,
}: AttendantCommissionsTableProps) {
  const isMobile = useIsMobile();

  if (attendantSummaries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center border rounded-lg bg-muted/10">
        <p className="text-sm text-muted-foreground">
          Nenhuma comissão para atendentes no período selecionado.
        </p>
      </div>
    );
  }

  // Calculate total commission for all attendants
  const totalOwnCommission = attendantSummaries.reduce((acc, attendant) => acc + attendant.totalCommission, 0);
  const totalReferralCommission = attendantSummaries.reduce((acc, attendant) => acc + attendant.totalReferralCommission, 0);
  const totalCommission = totalOwnCommission + totalReferralCommission;
  const totalPayments = attendantSummaries.reduce((acc, attendant) => acc + attendant.paymentsCount, 0);
  
  // Calculate the total original payment amount
  const totalPaymentAmount = attendantSummaries.reduce((acc, attendant) => acc + attendant.totalPaymentAmount, 0);

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table>
        <TableCaption>Comissões a pagar para atendentes no período</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Atendente</TableHead>
            <TableHead className={isMobile ? "hidden" : ""}>Pagamentos</TableHead>
            <TableHead>Total</TableHead>
            <TableHead className="text-right">Comissão Própria</TableHead>
            <TableHead className="text-right">Comissão Indicação</TableHead>
            <TableHead className="text-right">Total Comissão</TableHead>
            {(onRegisterPayment || getPaymentStatus) && (
              <TableHead className="text-center">Status</TableHead>
            )}
            {(onRegisterPayment || onViewHistory) && (
              <TableHead className="text-right">Ações</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {attendantSummaries.map((attendant) => {
            const paymentStatus = getPaymentStatus ? getPaymentStatus(attendant.id, attendant.totalCommission + attendant.totalReferralCommission) : undefined;
            const totalPaid = getTotalPaid ? getTotalPaid(attendant.id) : 0;
            const totalToReceive = attendant.totalCommission + attendant.totalReferralCommission;
            
            return (
              <TableRow key={attendant.id}>
                <TableCell className="font-medium">{attendant.nome}</TableCell>
                <TableCell className={isMobile ? "hidden" : ""}>{attendant.paymentsCount}</TableCell>
                <TableCell>{formatCurrency(attendant.totalPaymentAmount)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(attendant.totalCommission)}
                </TableCell>
                <TableCell className="text-right">
                  {attendant.totalReferralCommission > 0 ? (
                    <span className="text-amber-600 dark:text-amber-400">
                      {formatCurrency(attendant.totalReferralCommission)}
                    </span>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-right font-medium">
                  {formatCurrency(totalToReceive)}
                </TableCell>
                {(onRegisterPayment || getPaymentStatus) && paymentStatus && (
                  <TableCell className="text-center">
                    <AttendantPaymentStatusBadge 
                      status={paymentStatus}
                      totalPaid={totalPaid}
                      totalCommission={totalToReceive}
                      formatCurrency={formatCurrency}
                      showDetails
                    />
                  </TableCell>
                )}
                {(onRegisterPayment || onViewHistory) && (
                  <TableCell className="text-right">
                    <div className="flex gap-1 justify-end">
                      {onRegisterPayment && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onRegisterPayment(attendant.id)}
                        >
                          <DollarSign className="w-4 h-4 mr-1" />
                          Registrar
                        </Button>
                      )}
                      {onViewHistory && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewHistory(attendant.id)}
                        >
                          <History className="w-4 h-4 mr-1" />
                          Histórico
                        </Button>
                      )}
                    </div>
                  </TableCell>
                )}
              </TableRow>
            );
          })}
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell className="font-bold">Total</TableCell>
            <TableCell className={`font-bold ${isMobile ? "hidden" : ""}`}>{totalPayments}</TableCell>
            <TableCell className="font-bold">{formatCurrency(totalPaymentAmount)}</TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(totalOwnCommission)}
            </TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(totalReferralCommission)}
            </TableCell>
            <TableCell className="text-right font-bold">
              {formatCurrency(totalCommission)}
            </TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    </div>
  );
}

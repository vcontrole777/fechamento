import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface RecentPayment {
  id: string;
  name: string;
  tripeiro: string;
  type: string;
  amount: string;
  status: "completed" | "pending" | "failed";
  date: string;
}

interface RecentPaymentsTableProps {
  payments: RecentPayment[];
  className?: string;
}

const statusStyles: Record<RecentPayment["status"], string> = {
  completed: "bg-success/10 text-success border-success/20",
  failed: "bg-destructive/10 text-destructive border-destructive/20",
  pending: "bg-warning/10 text-warning border-warning/20",
};

const statusLabels: Record<RecentPayment["status"], string> = {
  completed: "Concluído",
  failed: "Falhou",
  pending: "Pendente",
};

export function RecentPaymentsTable({ payments, className }: RecentPaymentsTableProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle>Últimos Pagamentos</CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum pagamento no período
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Data</TableHead>
                <TableHead>Atendente</TableHead>
                <TableHead>Tripeiro</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Valor</TableHead>
                <TableHead className="text-right">Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="text-muted-foreground">{payment.date}</TableCell>
                  <TableCell className="font-medium">{payment.name}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.tripeiro}</TableCell>
                  <TableCell className="text-muted-foreground">{payment.type}</TableCell>
                  <TableCell className="text-right font-medium tabular-nums">
                    {payment.amount}
                  </TableCell>
                  <TableCell className="text-right">
                    <span
                      className={cn(
                        "rounded-full border px-2 py-0.5 text-xs",
                        statusStyles[payment.status]
                      )}
                    >
                      {statusLabels[payment.status]}
                    </span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}


import { DollarSign, CreditCard, UserCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface PaymentStatsProps {
  totalPayments: number;
  attendantCommission: number;
  tripeiroReceivable: number;
  isLoading: boolean;
}

export function PaymentStats({
  totalPayments,
  attendantCommission,
  tripeiroReceivable,
  isLoading,
}: PaymentStatsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Pagamentos</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              `R$ ${totalPayments.toFixed(2)}`
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comissão dos Atendentes</CardTitle>
          <UserCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              `R$ ${attendantCommission.toFixed(2)}`
            )}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor a Receber do Tripeiro</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {isLoading ? (
              <div className="h-8 w-24 animate-pulse rounded bg-muted"></div>
            ) : (
              `R$ ${tripeiroReceivable.toFixed(2)}`
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}


import { DollarSign, CreditCard, UserCheck, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface PaymentStatsProps {
  totalPayments: number;
  attendantCommission: number;
  tripeiroReceivable: number;
  isLoading: boolean;
  formatCurrency: (value: number) => string;
}

export function PaymentStats({
  totalPayments,
  attendantCommission,
  tripeiroReceivable,
  isLoading,
  formatCurrency,
}: PaymentStatsProps) {
  const attendantPercentage = totalPayments > 0 ? (attendantCommission / totalPayments) * 100 : 0;
  const tripeiroPercentage = totalPayments > 0 ? (tripeiroReceivable / totalPayments) * 100 : 0;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-3 w-full">
      <Card className="border-2 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Pagamentos
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-primary" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
          ) : (
            <>
              <div className="text-3xl font-bold">
                {formatCurrency(totalPayments)}
              </div>
              <p className="text-xs text-muted-foreground">
                Apenas pagamentos concluídos
              </p>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-2 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Comissão dos Atendentes
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-green-500/10 flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
          ) : (
            <>
              <div className="text-3xl font-bold">
                {formatCurrency(attendantCommission)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {attendantPercentage.toFixed(1)}% do total
                  </span>
                </div>
                <Progress value={attendantPercentage} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
      
      <Card className="border-2 hover:shadow-lg transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor a Receber do Tripeiro
            </CardTitle>
            <div className="h-10 w-10 rounded-full bg-orange-500/10 flex items-center justify-center">
              <CreditCard className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {isLoading ? (
            <div className="h-8 w-32 animate-pulse rounded bg-muted"></div>
          ) : (
            <>
              <div className="text-3xl font-bold">
                {formatCurrency(tripeiroReceivable)}
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">
                    {tripeiroPercentage.toFixed(1)}% do total
                  </span>
                </div>
                <Progress value={tripeiroPercentage} className="h-2" />
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

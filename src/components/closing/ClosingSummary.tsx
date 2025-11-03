
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClosingSummary as ClosingSummaryType } from "@/hooks/useClosingData";
import { ClipboardList, DollarSign, TrendingDown, TrendingUp, Users } from "lucide-react";

interface ClosingSummaryProps {
  summary: ClosingSummaryType;
  formatCurrency: (value: number) => string;
  isLoading: boolean;
}

export function ClosingSummary({ summary, formatCurrency, isLoading }: ClosingSummaryProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5 w-full animate-pulse">
        {[...Array(5)].map((_, i) => (
          <Card key={i} className="bg-muted/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                <div className="h-4 w-24 bg-muted rounded" />
              </CardTitle>
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-7 w-32 bg-muted rounded" />
              <div className="h-4 w-20 bg-muted rounded mt-1" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6 w-full">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalRevenue)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.paymentsCount} {summary.paymentsCount === 1 ? 'pagamento' : 'pagamentos'} no período
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comissão Atendentes</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalAttendantCommission)}</div>
          <p className="text-xs text-muted-foreground">
            {(summary.totalAttendantCommission / summary.totalRevenue * 100).toFixed(1)}% do faturamento
          </p>
        </CardContent>
      </Card>

      <Card className="bg-amber-50 dark:bg-amber-950/20">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comissão Indicação</CardTitle>
          <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{formatCurrency(summary.totalReferralCommission)}</div>
          <p className="text-xs text-muted-foreground">
            {(summary.totalReferralCommission / summary.totalRevenue * 100).toFixed(1)}% do faturamento
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Comissão Tripeiros</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalTripeiroCommission)}</div>
          <p className="text-xs text-muted-foreground">
            {(summary.totalTripeiroCommission / summary.totalRevenue * 100).toFixed(1)}% do faturamento
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Despesas</CardTitle>
          <TrendingDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatCurrency(summary.totalExpenses)}</div>
          <p className="text-xs text-muted-foreground">
            {summary.expensesCount} {summary.expensesCount === 1 ? 'despesa' : 'despesas'} no período
          </p>
        </CardContent>
      </Card>

      <Card className={summary.netProfit >= 0 ? "bg-green-50 dark:bg-green-950/20" : "bg-red-50 dark:bg-red-950/20"}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${summary.netProfit >= 0 ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"}`}>
            {formatCurrency(summary.netProfit)}
          </div>
          <p className="text-xs text-muted-foreground">
            {(summary.netProfit / summary.totalRevenue * 100).toFixed(1)}% do faturamento
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

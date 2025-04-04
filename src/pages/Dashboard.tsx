
import { Banknote, TrendingDown, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChartComponent } from "@/components/dashboard/BarChartComponent";
import { LineChartComponent } from "@/components/dashboard/LineChartComponent";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { TopAttendants } from "@/components/dashboard/TopAttendants";
import { useDashboardData } from "@/hooks/useDashboardData";

export default function Dashboard() {
  const {
    isLoading,
    topAttendants,
    revenueByMonth,
    expensesByMonth,
    recentPayments,
    recentExpenses,
    financialStats,
  } = useDashboardData();

  // Format currency in Brazilian style (R$ 1.000,00)
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Faturamento Total"
          value={isLoading ? "Carregando..." : formatCurrency(financialStats.totalRevenue)}
          icon={Banknote}
          trend={financialStats.revenueTrend}
          className="bg-gradient-to-br from-accent/10 to-accent/5"
        />
        <StatCard
          title="Gastos"
          value={isLoading ? "Carregando..." : formatCurrency(financialStats.totalExpenses)}
          icon={TrendingDown}
          trend={financialStats.expensesTrend}
          className="bg-gradient-to-br from-destructive/10 to-destructive/5"
        />
        <StatCard
          title="Lucro Líquido"
          value={isLoading ? "Carregando..." : formatCurrency(financialStats.netProfit)}
          icon={TrendingUp}
          trend={financialStats.profitTrend}
          className="bg-gradient-to-br from-success/10 to-success/5"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <LineChartComponent
          title="Faturamento por Mês"
          data={revenueByMonth}
          dataKey="valor"
        />
        <BarChartComponent
          title="Gastos por Mês"
          data={expensesByMonth}
          dataKey="valor"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <TopAttendants attendants={topAttendants} className="md:col-span-1" />
        <RecentTransactions
          transactions={recentPayments}
          title="Últimos Pagamentos"
          className="md:col-span-1"
        />
        <RecentTransactions
          transactions={recentExpenses}
          title="Últimos Gastos"
          className="md:col-span-1"
        />
      </div>
    </div>
  );
}

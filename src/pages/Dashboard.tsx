
import { Banknote, TrendingDown, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChartComponent } from "@/components/dashboard/BarChartComponent";
import { LineChartComponent } from "@/components/dashboard/LineChartComponent";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { TopAttendants } from "@/components/dashboard/TopAttendants";
import { useDashboardData } from "@/hooks/useDashboardData";
import { DateFilter, DateFilterOption } from "@/components/common/DateFilter";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const {
    isLoading,
    topAttendants,
    revenueByMonth,
    expensesByMonth,
    recentPayments,
    recentExpenses,
    financialStats,
    dateRange,
    updateDateRange,
  } = useDashboardData();

  const { updateSharedDateFilter } = useSharedDateFilter();
  const isMobile = useIsMobile();

  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleDateFilterChange = (newDateRange, option: DateFilterOption) => {
    updateDateRange(newDateRange);
    updateSharedDateFilter(newDateRange, option);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <h1 className="text-xl md:text-2xl font-bold">Dashboard</h1>
        <DateFilter onFilterChange={handleDateFilterChange} />
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Faturamento Total"
          value={isLoading ? "Carregando..." : formatCurrency(financialStats.totalRevenue)}
          icon={Banknote}
          trend={financialStats.revenueTrend}
          count={financialStats.paymentsCount}
          className="bg-gradient-to-br from-accent/10 to-accent/5"
        />
        <StatCard
          title="Gastos"
          value={isLoading ? "Carregando..." : formatCurrency(financialStats.totalExpenses)}
          icon={TrendingDown}
          trend={financialStats.expensesTrend}
          count={financialStats.expensesCount}
          className="bg-gradient-to-br from-destructive/10 to-destructive/5"
        />
        <StatCard
          title="Lucro Líquido"
          value={isLoading ? "Carregando..." : formatCurrency(financialStats.netProfit)}
          description="Faturamento - Comissões - Gastos"
          icon={TrendingUp}
          trend={financialStats.profitTrend}
          className="bg-gradient-to-br from-success/10 to-success/5"
        />
      </div>

      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2">
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

      <div className={`grid gap-4 md:gap-6 grid-cols-1 ${isMobile ? "" : "md:grid-cols-3"}`}>
        <TopAttendants 
          attendants={topAttendants} 
          className={isMobile ? "" : "md:col-span-1"} 
        />
        <RecentTransactions
          transactions={recentPayments}
          title="Últimos Pagamentos"
          className={isMobile ? "" : "md:col-span-1"}
        />
        <RecentTransactions
          transactions={recentExpenses}
          title="Últimos Gastos"
          className={isMobile ? "" : "md:col-span-1"}
        />
      </div>
    </div>
  );
}

import { useCallback } from "react";
import { Banknote, TrendingDown, TrendingUp, Users, Percent } from "lucide-react";
import { StatCardEnhanced } from "@/components/dashboard/StatCardEnhanced";
import { RecentPaymentsTable } from "@/components/dashboard/RecentPaymentsTable";
import { TopAttendants } from "@/components/dashboard/TopAttendants";
import { RemindersCard } from "@/components/dashboard/RemindersCard";
import { RevenueExpenseChart } from "@/components/dashboard/RevenueExpenseChart";
import { DistributionBreakdown } from "@/components/dashboard/DistributionBreakdown";
import { ClosingEquationStrip } from "@/components/dashboard/ClosingEquationStrip";
import { useDashboardEnhanced } from "@/hooks/useDashboardEnhanced";
import { DateFilter, DateFilterOption } from "@/components/common/DateFilter";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { formatCurrency } from "@/utils/currency";

export default function Dashboard() {
  const {
    isLoading,
    topAttendants,
    recentPayments,
    enhancedStats,
    updateDateRange,
    revenueExpenseData,
    distributionData,
    sparklineData,
  } = useDashboardEnhanced();

  const { updateSharedDateFilter } = useSharedDateFilter();

  const handleDateFilterChange = useCallback((newDateRange, option: DateFilterOption) => {
    updateDateRange(newDateRange);
    updateSharedDateFilter(newDateRange, option);
  }, [updateDateRange, updateSharedDateFilter]);

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold glow-text">Painel</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral do seu negócio
          </p>
        </div>
        <DateFilter onFilterChange={handleDateFilterChange} />
      </div>

      {/* Main Stats - 5 cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-2 lg:grid-cols-5">
        <StatCardEnhanced
          title="Faturamento Total"
          value={formatCurrency(enhancedStats.totalRevenue)}
          icon={Banknote}
          trend={enhancedStats.revenueTrend}
          count={enhancedStats.paymentsCount}
          className="glow-card border-2 border-primary"
          isLoading={isLoading}
          sparklineData={sparklineData}
          navigateTo="/pagamentos"
        />
        <StatCardEnhanced
          title="Despesas"
          value={formatCurrency(enhancedStats.totalExpenses)}
          icon={TrendingDown}
          trend={enhancedStats.expensesTrend}
          count={enhancedStats.expensesCount}
          className="glow-card border-2 border-destructive"
          isLoading={isLoading}
          navigateTo="/despesas"
        />
        <StatCardEnhanced
          title="Lucro Líquido"
          value={formatCurrency(enhancedStats.netProfit)}
          description="Faturamento - Comissões - Despesas"
          icon={TrendingUp}
          trend={enhancedStats.profitTrend}
          className="glow-card border-2 border-success"
          isLoading={isLoading}
        />
        <StatCardEnhanced
          title="Comissões Totais"
          value={formatCurrency(enhancedStats.totalCommissions)}
          description="Atendentes + Tripeiros"
          icon={Users}
          className="glow-card border-2 border-warning"
          isLoading={isLoading}
          navigateTo="/fechamento"
        />
        <StatCardEnhanced
          title="Ticket Médio"
          value={formatCurrency(enhancedStats.avgTicket)}
          description="Média por pagamento"
          icon={Percent}
          className="glow-card border-2 border-primary"
          isLoading={isLoading}
        />
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
        <RevenueExpenseChart data={revenueExpenseData} />
        <DistributionBreakdown
          data={distributionData}
          referralValue={enhancedStats.commissions.referral}
        />
      </div>

      {/* Closing equation strip */}
      <ClosingEquationStrip
        revenue={enhancedStats.totalRevenue}
        tripeiroCommission={enhancedStats.commissions.tripeiro}
        attendantCommission={enhancedStats.commissions.atendente}
        referralCommission={enhancedStats.commissions.referral}
        expenses={enhancedStats.totalExpenses}
        netProfit={enhancedStats.netProfit}
      />

      {/* Bottom Section - Recent payments table, Top Attendants and Reminders */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        <RecentPaymentsTable payments={recentPayments} className="lg:col-span-2" />
        <div className="grid gap-4 md:gap-6">
          <TopAttendants attendants={topAttendants} />
          <RemindersCard />
        </div>
      </div>
    </div>
  );
}

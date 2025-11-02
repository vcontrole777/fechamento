
import { useState } from "react";
import { Banknote, TrendingDown, TrendingUp, Users, Percent } from "lucide-react";
import { StatCardEnhanced } from "@/components/dashboard/StatCardEnhanced";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { TopAttendants } from "@/components/dashboard/TopAttendants";
import { NotesAndReminders } from "@/components/dashboard/NotesAndReminders";
import { RevenueExpenseChart } from "@/components/dashboard/RevenueExpenseChart";
import { DistributionPieChart } from "@/components/dashboard/DistributionPieChart";
import { AttendantsBarChart } from "@/components/dashboard/AttendantsBarChart";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { DashboardAlerts } from "@/components/dashboard/DashboardAlerts";
import { WeeklySummary } from "@/components/dashboard/WeeklySummary";
import { useDashboardEnhanced } from "@/hooks/useDashboardEnhanced";
import { DateFilter, DateFilterOption } from "@/components/common/DateFilter";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { useIsMobile } from "@/hooks/use-mobile";

export default function Dashboard() {
  const {
    isLoading,
    topAttendants,
    recentPayments,
    recentExpenses,
    enhancedStats,
    updateDateRange,
    revenueExpenseData,
    distributionData,
    attendantsBarData,
    weeklySummary,
    alerts,
    sparklineData,
  } = useDashboardEnhanced();

  const { updateSharedDateFilter } = useSharedDateFilter();
  const isMobile = useIsMobile();
  
  // Estado para controlar o dialog de notas
  const [noteDialogOpen, setNoteDialogOpen] = useState(false);

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

  const handleOpenNoteDialog = () => {
    setNoteDialogOpen(true);
  };

  return (
    <div className="flex flex-col gap-6 p-4 md:p-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold glow-text">Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Visão geral do seu negócio
          </p>
        </div>
        <DateFilter onFilterChange={handleDateFilterChange} />
      </div>

      {/* Alerts */}
      {alerts.length > 0 && <DashboardAlerts alerts={alerts} />}

      {/* Quick Actions */}
      <QuickActions onOpenNoteDialog={handleOpenNoteDialog} />

      {/* Main Stats - 5 cards */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-5">
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
        <DistributionPieChart data={distributionData} />
      </div>

      {/* Weekly Summary + Bar Chart */}
      <div className="grid gap-4 md:gap-6 grid-cols-1 lg:grid-cols-3">
        <WeeklySummary 
          {...weeklySummary}
          formatCurrency={formatCurrency}
        />
        <div className="lg:col-span-2">
          <AttendantsBarChart data={attendantsBarData} />
        </div>
      </div>

      {/* Notes and Reminders */}
      <div className="grid gap-4 md:gap-6 grid-cols-1">
        <NotesAndReminders onOpenDialog={handleOpenNoteDialog} />
      </div>

      {/* Bottom Section - Top Attendants and Recent Transactions */}
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
          title="Últimas Despesas"
          className={isMobile ? "" : "md:col-span-1"}
        />
      </div>
    </div>
  );
}

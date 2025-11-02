import { useMemo } from "react";
import { useDashboardData } from "./useDashboardData";
import { startOfWeek, endOfWeek, eachDayOfInterval, format, isWithinInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export function useDashboardEnhanced() {
  const dashboardData = useDashboardData();

  // Calculate additional stats
  const enhancedStats = useMemo(() => {
    const { financialStats } = dashboardData;
    
    const totalCommissions = (financialStats.commissions?.atendente || 0) + (financialStats.commissions?.tripeiro || 0);
    const avgTicket = financialStats.paymentsCount > 0 
      ? financialStats.totalRevenue / financialStats.paymentsCount 
      : 0;

    return {
      totalCommissions,
      avgTicket,
      totalAttendantCommission: financialStats.commissions?.atendente || 0,
      totalTripeiroCommission: financialStats.commissions?.tripeiro || 0,
      ...financialStats,
    };
  }, [dashboardData]);

  // Generate revenue vs expense chart data
  const revenueExpenseData = useMemo(() => {
    const today = new Date();
    const last7Days = eachDayOfInterval({
      start: new Date(today.getTime() - 6 * 24 * 60 * 60 * 1000),
      end: today,
    });

    return last7Days.map(day => {
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));

      const dayRevenue = dashboardData.recentPayments
        .filter(p => {
          const pDate = new Date(p.date);
          return pDate >= dayStart && pDate <= dayEnd;
        })
        .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9,-]/g, '').replace(',', '.')), 0);

      const dayExpenses = dashboardData.recentExpenses
        .filter(e => {
          const eDate = new Date(e.date);
          return eDate >= dayStart && eDate <= dayEnd;
        })
        .reduce((sum, e) => sum + parseFloat(e.amount.replace(/[^0-9,-]/g, '').replace(',', '.')), 0);

      return {
        date: format(day, 'dd/MM', { locale: ptBR }),
        receita: dayRevenue,
        despesas: dayExpenses,
      };
    });
  }, [dashboardData.recentPayments, dashboardData.recentExpenses]);

  // Generate distribution pie chart data
  const distributionData = useMemo(() => {
    const { totalRevenue, totalAttendantCommission, totalTripeiroCommission, totalExpenses, netProfit } = enhancedStats;

    return [
      { name: 'Lucro Líquido', value: Math.max(netProfit, 0), color: 'hsl(var(--success))' },
      { name: 'Comissões Atendentes', value: totalAttendantCommission, color: 'hsl(var(--primary))' },
      { name: 'Comissões Tripeiros', value: totalTripeiroCommission, color: 'hsl(var(--warning))' },
      { name: 'Despesas', value: totalExpenses, color: 'hsl(var(--destructive))' },
    ].filter(item => item.value > 0);
  }, [enhancedStats]);

  // Generate attendants bar chart data
  const attendantsBarData = useMemo(() => {
    return dashboardData.topAttendants.slice(0, 5).map(attendant => ({
      name: attendant.name.split(' ')[0], // First name only
      valor: attendant.sales,
    }));
  }, [dashboardData.topAttendants]);

  // Calculate weekly summary
  const weeklySummary = useMemo(() => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 0 });

    const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });

    const dailyRevenue = weekDays.map(day => {
      const dayStart = new Date(day.setHours(0, 0, 0, 0));
      const dayEnd = new Date(day.setHours(23, 59, 59, 999));

      const revenue = dashboardData.recentPayments
        .filter(p => {
          const pDate = new Date(p.date);
          return pDate >= dayStart && pDate <= dayEnd;
        })
        .reduce((sum, p) => sum + parseFloat(p.amount.replace(/[^0-9,-]/g, '').replace(',', '.')), 0);

      return {
        day: format(day, 'EEEE', { locale: ptBR }),
        value: revenue,
      };
    });

    const weekTotal = dailyRevenue.reduce((sum, d) => sum + d.value, 0);
    const sortedDays = [...dailyRevenue].sort((a, b) => b.value - a.value);

    return {
      weekTotal,
      weekGrowth: 15, // TODO: Calculate from previous week
      bestDay: sortedDays[0] || { day: 'N/A', value: 0 },
      worstDay: sortedDays[sortedDays.length - 1] || { day: 'N/A', value: 0 },
    };
  }, [dashboardData.recentPayments]);

  // Generate dashboard alerts
  const alerts = useMemo(() => {
    const alerts: Array<{ type: 'error' | 'warning' | 'info'; title: string; message: string }> = [];

    // Check for high expenses
    if (enhancedStats.totalExpenses > enhancedStats.totalRevenue * 0.5) {
      alerts.push({
        type: 'warning',
        title: 'Despesas Elevadas',
        message: 'Suas despesas representam mais de 50% do faturamento.',
      });
    }

    // Check for low profit margin
    const profitMargin = ((enhancedStats.netProfit / enhancedStats.totalRevenue) * 100);
    if (profitMargin < 20 && enhancedStats.totalRevenue > 0) {
      alerts.push({
        type: 'warning',
        title: 'Margem de Lucro Baixa',
        message: `Sua margem de lucro está em ${profitMargin.toFixed(1)}%. Considere revisar custos.`,
      });
    }

    return alerts;
  }, [enhancedStats]);

  // Generate sparkline data for stats
  const sparklineData = useMemo(() => {
    const last7Days = revenueExpenseData.map(d => d.receita);
    return last7Days;
  }, [revenueExpenseData]);

  return {
    ...dashboardData,
    enhancedStats,
    revenueExpenseData,
    distributionData,
    attendantsBarData,
    weeklySummary,
    alerts,
    sparklineData,
  };
}
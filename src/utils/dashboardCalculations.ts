
import { format, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";

// Calculate top attendants based on payments
export function calculateTopAttendants(attendants: any[], payments: any[]) {
  // Identify completed payments for attendants
  const completedPayments = payments.filter(payment => payment.status === "concluido");
  
  // Calculate sales totals for each attendant
  const attendantSales = attendants.map(attendant => {
    const attendantPayments = completedPayments.filter(
      payment => payment.id_atendente === attendant.id
    );
    
    const totalSales = attendantPayments.reduce(
      (sum, payment) => sum + Number(payment.valor), 
      0
    );
    
    return {
      id: attendant.id.toString(),
      name: attendant.nome,
      sales: totalSales
    };
  });
  
  // Sort by sales (highest first) and take top 4
  const sortedAttendants = attendantSales
    .sort((a, b) => b.sales - a.sales)
    .slice(0, 4);
    
  // Calculate progress percentages based on highest sales
  const highestSales = sortedAttendants.length > 0 ? sortedAttendants[0].sales : 1;
  
  return sortedAttendants.map(attendant => ({
    ...attendant,
    progress: Math.round((attendant.sales / highestSales) * 100)
  }));
}

// Calculate revenue by month for the chart
export function calculateRevenueByMonth(payments: any[]) {
  // Get only completed payments
  const completedPayments = payments.filter(payment => payment.status === "concluido");
  
  // Create an object to store revenue by month
  const revenueMap: Record<string, number> = {};
  
  // Get the last 6 months
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthKey = format(date, "MMM", { locale: ptBR });
    months.push(monthKey);
    revenueMap[monthKey] = 0;
  }
  
  // Sum the revenue for each month
  completedPayments.forEach(payment => {
    const date = new Date(payment.data);
    const monthKey = format(date, "MMM", { locale: ptBR });
    
    // Only include the last 6 months
    if (months.includes(monthKey)) {
      revenueMap[monthKey] += Number(payment.valor);
    }
  });
  
  // Convert to array for charts
  return months.map(month => ({
    name: month.charAt(0).toUpperCase() + month.slice(1),
    valor: revenueMap[month]
  }));
}

// Calculate expenses by month for the chart
export function calculateExpensesByMonth(expenses: any[]) {
  // Create an object to store expenses by month
  const expenseMap: Record<string, number> = {};
  
  // Get the last 6 months
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const date = subMonths(new Date(), i);
    const monthKey = format(date, "MMM", { locale: ptBR });
    months.push(monthKey);
    expenseMap[monthKey] = 0;
  }
  
  // Sum the expenses for each month
  expenses.forEach(expense => {
    const date = new Date(expense.data);
    const monthKey = format(date, "MMM", { locale: ptBR });
    
    // Only include the last 6 months
    if (months.includes(monthKey)) {
      expenseMap[monthKey] += Number(expense.valor);
    }
  });
  
  // Convert to array for charts
  return months.map(month => ({
    name: month.charAt(0).toUpperCase() + month.slice(1),
    valor: expenseMap[month]
  }));
}

// Calculate all financial statistics
export function calculateFinancialStats(payments: any[], expenses: any[]) {
  // Only consider completed payments
  const completedPayments = payments.filter(payment => payment.status === "concluido");
  
  // Calculate total revenue
  const totalRevenue = completedPayments.reduce(
    (sum, payment) => sum + Number(payment.valor), 
    0
  );
  
  // Calculate total expenses
  const totalExpenses = expenses.reduce(
    (sum, expense) => sum + Number(expense.valor), 
    0
  );
  
  // Calculate tripeiro and attendant commissions
  const commissions = completedPayments.reduce(
    (acc, payment) => {
      const totalPayment = Number(payment.valor);
      const tripeiroPercentage = payment.porcentagem_tripeiro || 0;
      const atendentePercentage = payment.porcentagem_atendente || 0;
      
      const tripeiroCommission = totalPayment * (tripeiroPercentage / 100);
      const atendenteCommission = (totalPayment - tripeiroCommission) * (atendentePercentage / 100);
      
      return {
        tripeiro: acc.tripeiro + tripeiroCommission,
        atendente: acc.atendente + atendenteCommission
      };
    },
    { tripeiro: 0, atendente: 0 }
  );
  
  // Calculate net profit using the formula:
  // Faturamento Total - Comissão do Tripéiro - Comissão do Atendente - Gastos
  const netProfit = totalRevenue - commissions.tripeiro - commissions.atendente - totalExpenses;
  
  // Calculate trends (comparing with previous period)
  // For simplicity, we're using fixed trend values
  // In a real application, you would compare with previous periods
  const revenueTrend = 12;
  const expensesTrend = -5;
  const profitTrend = 18;
  
  return {
    totalRevenue,
    totalExpenses,
    netProfit,
    revenueTrend,
    expensesTrend,
    profitTrend,
    paymentsCount: completedPayments.length,
    expensesCount: expenses.length,
    commissions
  };
}

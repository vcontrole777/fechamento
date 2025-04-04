
import { Banknote, TrendingDown, TrendingUp } from "lucide-react";
import { StatCard } from "@/components/dashboard/StatCard";
import { BarChartComponent } from "@/components/dashboard/BarChartComponent";
import { LineChartComponent } from "@/components/dashboard/LineChartComponent";
import { RecentTransactions } from "@/components/dashboard/RecentTransactions";
import { TopAttendants } from "@/components/dashboard/TopAttendants";

// Dados de exemplo
const revenueByMonth = [
  { name: "Jan", valor: 4000 },
  { name: "Fev", valor: 3000 },
  { name: "Mar", valor: 5000 },
  { name: "Abr", valor: 7000 },
  { name: "Mai", valor: 6000 },
  { name: "Jun", valor: 8000 },
];

const expensesByMonth = [
  { name: "Jan", valor: 3000 },
  { name: "Fev", valor: 2000 },
  { name: "Mar", valor: 3500 },
  { name: "Abr", valor: 4000 },
  { name: "Mai", valor: 3000 },
  { name: "Jun", valor: 4500 },
];

const recentPayments = [
  {
    id: "1",
    name: "João Silva",
    type: "Venda à vista",
    amount: "R$ 125,00",
    status: "completed" as const,
    date: "01/05/2025",
  },
  {
    id: "2",
    name: "Maria Oliveira",
    type: "Venda parcelada",
    amount: "R$ 350,00",
    status: "completed" as const,
    date: "30/04/2025",
  },
  {
    id: "3",
    name: "Pedro Souza",
    type: "Venda à vista",
    amount: "R$ 75,00",
    status: "completed" as const,
    date: "28/04/2025",
  },
  {
    id: "4",
    name: "Ana Pereira",
    type: "Venda parcelada",
    amount: "R$ 450,00",
    status: "pending" as const,
    date: "27/04/2025",
  },
];

const recentExpenses = [
  {
    id: "1",
    name: "Fornecedor A",
    type: "Matéria prima",
    amount: "R$ 1.250,00",
    status: "completed" as const,
    date: "29/04/2025",
  },
  {
    id: "2",
    name: "Aluguel",
    type: "Despesa fixa",
    amount: "R$ 3.500,00",
    status: "pending" as const,
    date: "02/05/2025",
  },
  {
    id: "3",
    name: "Energia",
    type: "Utilidade",
    amount: "R$ 750,00",
    status: "completed" as const,
    date: "25/04/2025",
  },
  {
    id: "4",
    name: "Marketing",
    type: "Publicidade",
    amount: "R$ 1.200,00",
    status: "completed" as const,
    date: "22/04/2025",
  },
];

const topAttendants = [
  {
    id: "1",
    name: "Mariana Santos",
    sales: 15000,
    progress: 100,
  },
  {
    id: "2",
    name: "Carlos Mendes",
    sales: 12500,
    progress: 83,
  },
  {
    id: "3",
    name: "Juliana Costa",
    sales: 9800,
    progress: 65,
  },
  {
    id: "4",
    name: "Rafael Oliveira",
    sales: 8200,
    progress: 55,
  },
];

export default function Dashboard() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <StatCard
          title="Faturamento Total"
          value="R$ 54.325,00"
          icon={Banknote}
          trend={12}
          className="bg-gradient-to-br from-accent/10 to-accent/5"
        />
        <StatCard
          title="Gastos"
          value="R$ 23.450,00"
          icon={TrendingDown}
          trend={-5}
          className="bg-gradient-to-br from-destructive/10 to-destructive/5"
        />
        <StatCard
          title="Lucro Líquido"
          value="R$ 30.875,00"
          icon={TrendingUp}
          trend={18}
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

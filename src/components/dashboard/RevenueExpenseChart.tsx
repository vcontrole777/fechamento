import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

interface RevenueExpenseChartProps {
  data: Array<{
    date: string;
    receita: number;
    despesas: number;
  }>;
}

export function RevenueExpenseChart({ data }: RevenueExpenseChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Receita vs Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis 
              dataKey="date" 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <YAxis 
              className="text-xs"
              tick={{ fill: 'hsl(var(--muted-foreground))' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'hsl(var(--background))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line 
              type="monotone" 
              dataKey="receita" 
              stroke="hsl(var(--primary))" 
              strokeWidth={2}
              name="Receita"
            />
            <Line 
              type="monotone" 
              dataKey="despesas" 
              stroke="hsl(var(--destructive))" 
              strokeWidth={2}
              name="Despesas"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
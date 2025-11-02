import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface WeeklySummaryProps {
  bestDay: {
    day: string;
    value: number;
  };
  worstDay: {
    day: string;
    value: number;
  };
  weekTotal: number;
  weekGrowth: number;
  formatCurrency: (value: number) => string;
}

export function WeeklySummary({ 
  bestDay, 
  worstDay, 
  weekTotal, 
  weekGrowth,
  formatCurrency 
}: WeeklySummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Resumo Semanal
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex justify-between items-center p-3 rounded-lg bg-muted/50">
          <span className="text-sm text-muted-foreground">Total da Semana</span>
          <span className="text-xl font-bold">{formatCurrency(weekTotal)}</span>
        </div>
        
        <div className="flex items-center gap-2">
          {weekGrowth >= 0 ? (
            <TrendingUp className="h-4 w-4 text-success" />
          ) : (
            <TrendingDown className="h-4 w-4 text-destructive" />
          )}
          <span className={cn(
            "text-sm font-medium",
            weekGrowth >= 0 ? "text-success" : "text-destructive"
          )}>
            {weekGrowth >= 0 ? '+' : ''}{weekGrowth}% vs semana anterior
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg border bg-success/5 border-success/20">
            <p className="text-xs text-muted-foreground mb-1">Melhor Dia</p>
            <p className="font-semibold text-sm">{bestDay.day}</p>
            <p className="text-xs text-success">{formatCurrency(bestDay.value)}</p>
          </div>
          
          <div className="p-3 rounded-lg border bg-destructive/5 border-destructive/20">
            <p className="text-xs text-muted-foreground mb-1">Pior Dia</p>
            <p className="font-semibold text-sm">{worstDay.day}</p>
            <p className="text-xs text-destructive">{formatCurrency(worstDay.value)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
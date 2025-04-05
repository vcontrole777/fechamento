
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  trend?: number;
  className?: string;
  count?: number;
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  count,
}: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {Icon && <Icon className="h-4 w-4 text-muted-foreground" />}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {count !== undefined && (
          <p className="text-xs text-muted-foreground mt-1">
            {count} {count === 1 ? 'registro' : 'registros'} no período
          </p>
        )}
        {description && !count && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {typeof trend === 'number' && (
          <div className={cn(
            "text-xs font-medium mt-2",
            trend > 0 ? "text-success" : trend < 0 ? "text-destructive" : "text-muted-foreground"
          )}>
            {trend > 0 ? "+" : ""}{trend}% em relação ao mês anterior
          </div>
        )}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown, Minus, LucideIcon } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useNavigate } from "react-router-dom";

interface StatCardEnhancedProps {
  title: string;
  value: string;
  description?: string;
  icon?: LucideIcon;
  trend?: number;
  className?: string;
  count?: number;
  isLoading?: boolean;
  sparklineData?: number[];
  navigateTo?: string;
}

export function StatCardEnhanced({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  count,
  isLoading,
  sparklineData,
  navigateTo,
}: StatCardEnhancedProps) {
  const navigate = useNavigate();

  const getTrendIcon = () => {
    if (!trend) return <Minus className="h-3 w-3" />;
    return trend > 0 ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />;
  };

  const getTrendColor = () => {
    if (!trend) return "text-muted-foreground";
    return trend > 0 ? "text-success" : "text-destructive";
  };

  if (isLoading) {
    return (
      <Card className={cn("overflow-hidden", className)}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-7 w-7 rounded-full" />
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <Skeleton className="h-7 w-32 mb-2" />
          <Skeleton className="h-3 w-20" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "overflow-hidden transition-all hover:shadow-lg",
        navigateTo && "cursor-pointer hover:scale-[1.02]",
        className
      )}
      onClick={() => navigateTo && navigate(navigateTo)}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 p-4 pb-1.5">
        <CardTitle className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
          {title}
        </CardTitle>
        {Icon && (
          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-3.5 w-3.5 text-primary" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="text-xl font-bold tabular-nums mb-1">{value}</div>

        {count !== undefined && (
          <p className="text-xs text-muted-foreground mb-2">
            {count} {count === 1 ? 'registro' : 'registros'} no período
          </p>
        )}

        {description && !count && (
          <p className="text-xs text-muted-foreground mb-2">{description}</p>
        )}

        {typeof trend === 'number' && (
          <div className={cn(
            "inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium",
            getTrendColor()
          )}>
            {getTrendIcon()}
            <span>
              {Math.abs(trend)}% vs período anterior
            </span>
          </div>
        )}

        {sparklineData && sparklineData.length > 0 && (
          <div className="mt-3 h-10">
            <svg width="100%" height="100%" viewBox="0 0 100 30">
              <polyline
                points={sparklineData.map((value, index) => {
                  const x = (index / (sparklineData.length - 1)) * 100;
                  const max = Math.max(...sparklineData);
                  const min = Math.min(...sparklineData);
                  const y = 30 - ((value - min) / (max - min)) * 25;
                  return `${x},${y}`;
                }).join(' ')}
                fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="2"
                className="opacity-50"
              />
            </svg>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
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
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
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
  variant = "default",
}: StatCardEnhancedProps) {
  const navigate = useNavigate();

  const variantStyles = {
    default: {
      icon: "bg-muted text-muted-foreground",
      indicator: "bg-muted",
    },
    primary: {
      icon: "bg-primary/10 text-primary",
      indicator: "bg-primary",
    },
    success: {
      icon: "bg-success/10 text-success",
      indicator: "bg-success",
    },
    warning: {
      icon: "bg-warning/10 text-warning",
      indicator: "bg-warning",
    },
    destructive: {
      icon: "bg-destructive/10 text-destructive",
      indicator: "bg-destructive",
    },
  };

  const styles = variantStyles[variant];

  if (isLoading) {
    return (
      <Card className={cn("p-5", className)}>
        <div className="flex items-start justify-between">
          <div className="space-y-3 flex-1">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl" />
        </div>
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        "p-5 relative overflow-hidden group",
        navigateTo && "cursor-pointer hover:shadow-soft-lg",
        className
      )}
      onClick={() => navigateTo && navigate(navigateTo)}
    >
      {/* Top indicator bar */}
      <div className={cn("absolute top-0 left-0 right-0 h-1", styles.indicator)} />

      <div className="flex items-start justify-between">
        <div className="space-y-1 flex-1 min-w-0">
          <p className="text-sm text-muted-foreground font-medium">{title}</p>
          <p className="text-2xl font-semibold tracking-tight truncate tabular-nums">
            {value}
          </p>

          {count !== undefined && (
            <p className="text-xs text-muted-foreground">
              {count} {count === 1 ? "registro" : "registros"}
            </p>
          )}

          {description && !count && (
            <p className="text-xs text-muted-foreground">{description}</p>
          )}

          {typeof trend === "number" && (
            <div
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium mt-2",
                trend > 0
                  ? "text-success"
                  : trend < 0
                  ? "text-destructive"
                  : "text-muted-foreground"
              )}
            >
              {trend > 0 ? (
                <TrendingUp className="h-3.5 w-3.5" />
              ) : trend < 0 ? (
                <TrendingDown className="h-3.5 w-3.5" />
              ) : (
                <Minus className="h-3.5 w-3.5" />
              )}
              <span>
                {trend > 0 ? "+" : ""}
                {trend}% vs período anterior
              </span>
            </div>
          )}
        </div>

        {Icon && (
          <div
            className={cn(
              "flex items-center justify-center w-11 h-11 rounded-xl transition-transform group-hover:scale-110",
              styles.icon
            )}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}
      </div>

      {/* Mini sparkline */}
      {sparklineData && sparklineData.length > 1 && (
        <div className="mt-4 h-8">
          <svg
            width="100%"
            height="100%"
            viewBox="0 0 100 30"
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            <defs>
              <linearGradient id={`gradient-${title}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
                <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Area fill */}
            <path
              d={
                sparklineData
                  .map((value, index) => {
                    const x = (index / (sparklineData.length - 1)) * 100;
                    const max = Math.max(...sparklineData);
                    const min = Math.min(...sparklineData);
                    const range = max - min || 1;
                    const y = 28 - ((value - min) / range) * 24;
                    return `${index === 0 ? "M" : "L"} ${x} ${y}`;
                  })
                  .join(" ") +
                ` L 100 30 L 0 30 Z`
              }
              fill={`url(#gradient-${title})`}
            />
            {/* Line */}
            <polyline
              points={sparklineData
                .map((value, index) => {
                  const x = (index / (sparklineData.length - 1)) * 100;
                  const max = Math.max(...sparklineData);
                  const min = Math.min(...sparklineData);
                  const range = max - min || 1;
                  const y = 28 - ((value - min) / range) * 24;
                  return `${x},${y}`;
                })
                .join(" ")}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {/* End dot */}
            <circle
              cx="100"
              cy={
                28 -
                ((sparklineData[sparklineData.length - 1] - Math.min(...sparklineData)) /
                  (Math.max(...sparklineData) - Math.min(...sparklineData) || 1)) *
                  24
              }
              r="3"
              fill="hsl(var(--primary))"
            />
          </svg>
        </div>
      )}
    </Card>
  );
}

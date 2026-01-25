import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "default" | "primary" | "success" | "warning" | "destructive";
}

export function StatsCard({ title, value, icon: Icon, description, trend, variant = "default" }: StatsCardProps) {
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

  return (
    <Card className="relative overflow-hidden">
      <div className={cn("absolute top-0 left-0 right-0 h-1", styles.indicator)} />
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-semibold mt-1 tabular-nums">{value}</h3>
            {description && (
              <p className="text-xs text-muted-foreground mt-1">{description}</p>
            )}
            {trend && (
              <p className={cn(
                "text-xs font-medium mt-2",
                trend.isPositive ? "text-success" : "text-destructive"
              )}>
                {trend.value}
              </p>
            )}
          </div>
          <div className={cn(
            "h-11 w-11 rounded-xl flex items-center justify-center",
            styles.icon
          )}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

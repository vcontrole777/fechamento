import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Clock, AlertCircle } from "lucide-react";

interface AttendantPaymentStatusBadgeProps {
  status: 'pendente' | 'pago_parcial' | 'pago_total';
  totalPaid?: number;
  totalCommission?: number;
  formatCurrency?: (value: number) => string;
  showDetails?: boolean;
}

export function AttendantPaymentStatusBadge({ 
  status, 
  totalPaid = 0, 
  totalCommission = 0,
  formatCurrency,
  showDetails = false
}: AttendantPaymentStatusBadgeProps) {
  const statusConfig = {
    pendente: {
      label: "Pendente",
      variant: "destructive" as const,
      icon: Clock,
    },
    pago_parcial: {
      label: "Parcialmente Pago",
      variant: "secondary" as const,
      icon: AlertCircle,
    },
    pago_total: {
      label: "Pago",
      variant: "default" as const,
      icon: CheckCircle2,
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;
  const remaining = totalCommission - totalPaid;

  return (
    <div className="flex flex-col gap-1">
      <Badge variant={config.variant} className="w-fit">
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </Badge>
      {showDetails && formatCurrency && (
        <div className="text-xs text-muted-foreground">
          {status === 'pago_total' ? (
            <span className="text-green-600 dark:text-green-400">
              Total pago: {formatCurrency(totalPaid)}
            </span>
          ) : status === 'pago_parcial' ? (
            <>
              <div>Pago: {formatCurrency(totalPaid)}</div>
              <div className="text-orange-600 dark:text-orange-400">
                Falta: {formatCurrency(remaining)}
              </div>
            </>
          ) : (
            <span className="text-red-600 dark:text-red-400">
              Não pago
            </span>
          )}
        </div>
      )}
    </div>
  );
}

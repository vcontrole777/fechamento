import { Badge } from "@/components/ui/badge";

interface TripeiroPaymentStatusBadgeProps {
  status: 'pendente' | 'parcialmente_pago' | 'pago';
  valorPago: number;
  valorAReceber: number;
  formatCurrency: (value: number) => string;
}

export function TripeiroPaymentStatusBadge({
  status,
  valorPago,
  valorAReceber,
  formatCurrency,
}: TripeiroPaymentStatusBadgeProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'pago':
        return {
          label: 'Pago',
          className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
        };
      case 'parcialmente_pago':
        return {
          label: 'Parcialmente Pago',
          className: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
        };
      default:
        return {
          label: 'Pendente',
          className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
        };
    }
  };

  const config = getStatusConfig();
  const pendente = valorAReceber - valorPago;

  return (
    <div className="flex flex-col gap-1">
      <Badge className={config.className}>
        {config.label}
      </Badge>
      <div className="text-xs text-muted-foreground">
        <div>Pago: {formatCurrency(valorPago)}</div>
        {pendente > 0 && <div>Pendente: {formatCurrency(pendente)}</div>}
      </div>
    </div>
  );
}

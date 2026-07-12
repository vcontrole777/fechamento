import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";

interface DistributionItem {
  name: string;
  value: number;
  color: string;
}

interface DistributionBreakdownProps {
  data: DistributionItem[];
  referralValue: number;
}

export function DistributionBreakdown({ data, referralValue }: DistributionBreakdownProps) {
  const total = data.reduce((sum, item) => sum + item.value, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Distribuição Financeira</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {total > 0 && (
          <div className="flex h-3 w-full overflow-hidden rounded-full bg-muted">
            {data.map((item) => (
              <div
                key={item.name}
                style={{ width: `${(item.value / total) * 100}%`, backgroundColor: item.color }}
                title={`${item.name}: ${formatCurrency(item.value)}`}
              />
            ))}
          </div>
        )}
        <div className="space-y-2">
          {data.map((item) => {
            const percent = total > 0 ? (item.value / total) * 100 : 0;
            return (
              <div key={item.name} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <span
                    className="h-2.5 w-2.5 shrink-0 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="truncate text-muted-foreground">{item.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-medium tabular-nums">{formatCurrency(item.value)}</span>
                  <span className="w-12 text-right text-xs text-muted-foreground tabular-nums">
                    {percent.toFixed(0)}%
                  </span>
                </div>
              </div>
            );
          })}
          {referralValue > 0 && (
            <div className="flex items-center justify-between border-t border-border pt-2 text-xs text-muted-foreground">
              <span>Indicação (dentro de atendentes)</span>
              <span className="tabular-nums">{formatCurrency(referralValue)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

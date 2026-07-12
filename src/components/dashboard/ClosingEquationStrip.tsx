import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/utils/currency";
import { cn } from "@/lib/utils";

interface ClosingEquationStripProps {
  revenue: number;
  tripeiroCommission: number;
  attendantCommission: number;
  referralCommission: number;
  expenses: number;
  netProfit: number;
}

export function ClosingEquationStrip({
  revenue,
  tripeiroCommission,
  attendantCommission,
  referralCommission,
  expenses,
  netProfit,
}: ClosingEquationStripProps) {
  const terms = [
    { label: "Faturamento", value: revenue, sign: "" },
    { label: "Tripeiros", value: tripeiroCommission, sign: "−" },
    { label: "Atendentes", value: attendantCommission, sign: "−" },
    { label: "Indicação", value: referralCommission, sign: "−" },
    { label: "Despesas", value: expenses, sign: "−" },
  ];

  return (
    <Card className="glow-card">
      <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-3 py-4 divide-x divide-border [&>*:not(:first-child)]:pl-5">
        {terms.map((term) => (
          <div key={term.label} className="flex flex-col">
            <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
              {term.label}
            </span>
            <span className="text-sm font-semibold tabular-nums">
              {term.sign} {formatCurrency(term.value)}
            </span>
          </div>
        ))}
        <span className="text-lg font-bold text-muted-foreground/60" aria-hidden="true">
          =
        </span>
        <div className="flex flex-col">
          <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
            Lucro Líquido
          </span>
          <span
            className={cn(
              "text-base font-bold tabular-nums",
              netProfit >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {formatCurrency(netProfit)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

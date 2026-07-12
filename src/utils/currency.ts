export function formatBrazilianCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function formatCurrency(value: number): string {
  return `R$ ${formatBrazilianCurrency(value)}`;
}

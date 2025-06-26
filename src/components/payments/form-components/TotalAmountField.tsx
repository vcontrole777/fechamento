
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { PaymentFormValues } from "../schemas/paymentFormSchema";

interface TotalAmountFieldProps {
  control: Control<PaymentFormValues>;
}

export function TotalAmountField({ control }: TotalAmountFieldProps) {
  // Função para formatar valores monetários no padrão brasileiro
  const formatBrazilianCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  // Função para converter valor formatado para número
  const parseBrazilianCurrency = (value: string): number => {
    const cleanValue = value.replace(/\./g, '').replace(',', '.');
    return parseFloat(cleanValue) || 0;
  };

  // Função para formatar valor no input
  const formatInputValue = (value: number): string => {
    if (value === 0) return '';
    return formatBrazilianCurrency(value);
  };

  return (
    <FormField
      control={control}
      name="valor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Valor Total</FormLabel>
          <FormControl>
            <Input
              placeholder="0,00"
              value={formatInputValue(field.value)}
              onChange={(e) => {
                const numericValue = parseBrazilianCurrency(e.target.value);
                field.onChange(numericValue);
              }}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

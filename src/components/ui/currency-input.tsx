import * as React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";

// Utility functions for Brazilian currency formatting
export const formatBrazilianCurrency = (value: number) => {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

export const parseBrazilianCurrency = (value: string): number => {
  const cleanValue = value.replace(/\./g, '').replace(',', '.');
  return parseFloat(cleanValue) || 0;
};

export const formatInputValue = (value: number): string => {
  if (value === 0) return '';
  return formatBrazilianCurrency(value);
};

// Currency Input Component Props
interface CurrencyInputProps extends Omit<React.ComponentProps<"input">, "onChange" | "value"> {
  value: number;
  onChange: (value: number) => void;
}

// Standalone Currency Input Component
export const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, value, onChange, ...props }, ref) => {
    return (
      <Input
        {...props}
        ref={ref}
        className={className}
        placeholder="0,00"
        value={formatInputValue(value)}
        onChange={(e) => {
          const numericValue = parseBrazilianCurrency(e.target.value);
          onChange(numericValue);
        }}
      />
    );
  }
);

CurrencyInput.displayName = "CurrencyInput";

// Form Field Currency Input Props
interface CurrencyFormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
> {
  control: Control<TFieldValues>;
  name: TName;
  label: string;
  placeholder?: string;
  className?: string;
}

// Form Field Currency Input Component
export function CurrencyFormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>
>({ 
  control, 
  name, 
  label, 
  placeholder = "0,00", 
  className 
}: CurrencyFormFieldProps<TFieldValues, TName>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <CurrencyInput
              value={field.value}
              onChange={field.onChange}
              placeholder={placeholder}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
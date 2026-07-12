import * as React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control, FieldPath, FieldValues } from "react-hook-form";
import { cn } from "@/lib/utils";
import { formatBrazilianCurrency } from "@/utils/currency";

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
    const [displayValue, setDisplayValue] = React.useState('');
    const [isFocused, setIsFocused] = React.useState(false);

    React.useEffect(() => {
      if (!isFocused) {
        setDisplayValue(formatInputValue(value));
      }
    }, [value, isFocused]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputValue = e.target.value;
      setDisplayValue(inputValue);
      const numericValue = parseBrazilianCurrency(inputValue);
      onChange(numericValue);
    };

    const handleFocus = () => {
      setIsFocused(true);
      setDisplayValue(value > 0 ? value.toString().replace('.', ',') : '');
    };

    const handleBlur = () => {
      setIsFocused(false);
      setDisplayValue(formatInputValue(value));
    };

    return (
      <Input
        {...props}
        ref={ref}
        className={className}
        placeholder="0,00"
        value={displayValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
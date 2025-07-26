
import { Control } from "react-hook-form";
import { PaymentFormValues } from "../schemas/paymentFormSchema";
import { CurrencyFormField } from "@/components/ui/currency-input";

interface TotalAmountFieldProps {
  control: Control<PaymentFormValues>;
}

export function TotalAmountField({ control }: TotalAmountFieldProps) {
  return (
    <CurrencyFormField
      control={control}
      name="valor"
      label="Valor Total"
    />
  );
}

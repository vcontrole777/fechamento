
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { PaymentFormValues } from "../schemas/paymentFormSchema";

interface TotalAmountFieldProps {
  control: Control<PaymentFormValues>;
}

export function TotalAmountField({ control }: TotalAmountFieldProps) {
  return (
    <FormField
      control={control}
      name="valor"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Valor Total</FormLabel>
          <FormControl>
            <Input
              type="number"
              step="0.01"
              placeholder="0.00"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}


import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { Control } from "react-hook-form";
import { PaymentFormValues } from "../schemas/paymentFormSchema";

interface DatePickerFieldProps {
  control: Control<PaymentFormValues>;
}

export function DatePickerField({ control }: DatePickerFieldProps) {
  return (
    <FormField
      control={control}
      name="data"
      render={({ field }) => (
        <FormItem className="flex flex-col">
          <FormLabel>Data</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full pl-3 text-left font-normal",
                    !field.value && "text-muted-foreground"
                  )}
                >
                  {field.value ? (
                    format(field.value, "dd/MM/yyyy", { locale: ptBR })
                  ) : (
                    <span>Selecione uma data</span>
                  )}
                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value}
                onSelect={(date) => {
                  if (date) {
                    console.log("Calendar date selected:", date);
                    console.log("Selected date components:", {
                      year: date.getFullYear(),
                      month: date.getMonth() + 1,
                      day: date.getDate()
                    });
                    
                    // Create a new date with only the date part to avoid timezone issues
                    const normalizedDate = new Date(
                      date.getFullYear(), 
                      date.getMonth(), 
                      date.getDate(), 
                      12, // noon to avoid any timezone issues
                      0, 
                      0
                    );
                    
                    console.log("Normalized date:", normalizedDate.toISOString());
                    field.onChange(normalizedDate);
                  }
                }}
                locale={ptBR}
                disabled={(date) => {
                  const today = new Date();
                  today.setHours(23, 59, 59, 999);
                  return date > today || date < new Date("1900-01-01");
                }}
                initialFocus
                className="pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

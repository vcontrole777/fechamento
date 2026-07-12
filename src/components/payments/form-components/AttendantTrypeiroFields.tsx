
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Control } from "react-hook-form";
import { PaymentFormValues } from "../schemas/paymentFormSchema";
import { Attendant, Tripeiro } from "@/types/payment.types";

interface AttendantTrypeiroFieldsProps {
  control: Control<PaymentFormValues>;
  attendants: Attendant[];
  tripeiros: Tripeiro[];
  onTripeiroChange: (value: string) => void;
}

export function AttendantTrypeiroFields({
  control,
  attendants,
  tripeiros,
  onTripeiroChange,
}: AttendantTrypeiroFieldsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <FormField
        control={control}
        name="id_atendente"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Atendente</FormLabel>
            <Select
              onValueChange={field.onChange}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um atendente" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {attendants.map((attendant) => (
                  <SelectItem key={attendant.id} value={attendant.id.toString()}>
                    {attendant.nome} ({attendant.porcentagem}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="id_tripeiro"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tripeiro</FormLabel>
            <Select
              onValueChange={(value) => {
                field.onChange(value);
                onTripeiroChange(value);
              }}
              defaultValue={field.value}
              value={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tripeiro" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {tripeiros.map((tripeiro) => (
                  <SelectItem key={tripeiro.id} value={tripeiro.id.toString()}>
                    {tripeiro.nome} ({tripeiro.porcentagem}%)
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

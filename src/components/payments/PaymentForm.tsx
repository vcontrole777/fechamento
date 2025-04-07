
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { paymentFormSchema, PaymentFormValues } from "./schemas/paymentFormSchema";
import { Payment } from "@/types/payment.types";
import { useAttendantsAndTripeiros } from "./hooks/useAttendantsAndTripeiros";
import { useState, useEffect } from "react";
import { DatePickerField } from "./form-components/DatePickerField";
import { TotalAmountField } from "./form-components/TotalAmountField";
import { AttendantTrypeiroFields } from "./form-components/AttendantTrypeiroFields";
import { PercentageSlider } from "./form-components/PercentageSlider";
import { PaymentDetailsFields } from "./form-components/PaymentDetailsFields";
import { CalculationPreview } from "./form-components/CalculationPreview";

interface PaymentFormProps {
  onSubmit: (
    values: PaymentFormValues, 
    attendantPercentage: number, 
    tripeiroPercentage: number
  ) => void;
  payment?: Payment;
  isSubmitting?: boolean;
}

export function PaymentForm({ onSubmit, payment, isSubmitting = false }: PaymentFormProps) {
  const { attendants, tripeiros } = useAttendantsAndTripeiros();
  const [selectedAttendantPercentage, setSelectedAttendantPercentage] = useState<number>(0);
  const [selectedTripeiroPercentage, setSelectedTripeiroPercentage] = useState<number>(0);
  const [useCustomTripeiroPercentage, setUseCustomTripeiroPercentage] = useState<boolean>(false);
  const [customTripeiroPercentage, setCustomTripeiroPercentage] = useState<number>(0);

  const getInitialDate = () => {
    if (payment) {
      console.log("Payment date from database:", payment.data);
      try {
        // Parse the date string in YYYY-MM-DD format
        const [year, month, day] = payment.data.split('-').map(num => parseInt(num));
        console.log(`Creating date from parts: year=${year}, month=${month-1}, day=${day}`);
        
        // Create a new date with the year, month (0-indexed), and day
        return new Date(year, month - 1, day);
      } catch (error) {
        console.error("Error parsing date:", error);
        return new Date();
      }
    }
    return new Date();
  };

  const form = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: payment
      ? {
          data: getInitialDate(),
          valor: payment.valor,
          id_atendente: payment.id_atendente?.toString() || undefined,
          id_tripeiro: payment.id_tripeiro?.toString() || undefined,
          tipo: payment.tipo,
          status: payment.status,
        }
      : {
          data: new Date(),
          valor: 0,
          tipo: "pix",
          status: "pendente",
        },
  });

  useEffect(() => {
    const attendantId = form.watch("id_atendente");
    const tripeiroId = form.watch("id_tripeiro");

    if (attendantId) {
      const attendant = attendants.find(a => a.id.toString() === attendantId);
      if (attendant) {
        setSelectedAttendantPercentage(attendant.porcentagem);
      }
    }

    if (tripeiroId) {
      const tripeiro = tripeiros.find(t => t.id.toString() === tripeiroId);
      if (tripeiro) {
        setSelectedTripeiroPercentage(tripeiro.porcentagem);
        if (!useCustomTripeiroPercentage) {
          setCustomTripeiroPercentage(tripeiro.porcentagem);
        }
      }
    }
  }, [
    form.watch("id_atendente"), 
    form.watch("id_tripeiro"), 
    attendants, 
    tripeiros, 
    useCustomTripeiroPercentage
  ]);

  const handleTripeiroChange = (value: string) => {
    setUseCustomTripeiroPercentage(false);
  };

  const handleSliderChange = (value: number[]) => {
    setCustomTripeiroPercentage(value[0]);
  };

  const handleToggleCustomPercentage = (value: boolean) => {
    setUseCustomTripeiroPercentage(value);
  };

  const handleSubmit = (values: PaymentFormValues) => {
    console.log("Submitting form with date:", values.data);
    // Ensure date is properly recorded as a Date object
    const date = values.data instanceof Date ? values.data : new Date(values.data);
    console.log("Date type:", Object.prototype.toString.call(date));
    console.log("Date year/month/day:", date.getFullYear(), date.getMonth() + 1, date.getDate());
    
    // Pass the values with a guaranteed Date object
    const submissionValues = {
      ...values,
      data: date
    };
    
    const tripeiroPercentageToSubmit = useCustomTripeiroPercentage 
      ? customTripeiroPercentage 
      : selectedTripeiroPercentage;
    
    onSubmit(submissionValues, selectedAttendantPercentage, tripeiroPercentageToSubmit);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <DatePickerField control={form.control} />
        
        <TotalAmountField control={form.control} />
        
        <AttendantTrypeiroFields 
          control={form.control}
          attendants={attendants}
          tripeiros={tripeiros}
          onTripeiroChange={handleTripeiroChange}
        />

        {form.watch("id_tripeiro") && (
          <PercentageSlider 
            useCustomPercentage={useCustomTripeiroPercentage}
            customPercentage={customTripeiroPercentage}
            defaultPercentage={selectedTripeiroPercentage}
            onPercentageChange={handleSliderChange}
            onToggleCustomPercentage={handleToggleCustomPercentage}
          />
        )}

        <PaymentDetailsFields control={form.control} />

        <CalculationPreview 
          totalValue={form.watch("valor") || 0}
          tripeiroPercentage={useCustomTripeiroPercentage ? customTripeiroPercentage : selectedTripeiroPercentage}
          attendantPercentage={selectedAttendantPercentage}
          useCustomTripeiroPercentage={useCustomTripeiroPercentage}
          selectedTripeiroPercentage={selectedTripeiroPercentage}
        />

        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting}>
            {payment ? "Atualizar Pagamento" : "Adicionar Pagamento"}
          </Button>
        </div>
      </form>
    </Form>
  );
}

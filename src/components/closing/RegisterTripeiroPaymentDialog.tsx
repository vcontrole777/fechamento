import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TripeiroPaymentForm } from "./TripeiroPaymentForm";
import { TripeiroPaymentFormData } from "./schemas/tripeiroPaymentSchema";
import { useAddTripeiroPayment } from "@/hooks/tripeiroPayments/useAddTripeiroPayment";
import { supabase } from "@/integrations/supabase/client";

interface RegisterTripeiroPaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  tripeiro: {
    id: number;
    nome: string;
    valorAReceber: number;
    periodoInicio: string;
    periodoFim: string;
  } | null;
}

export function RegisterTripeiroPaymentDialog({
  open,
  onOpenChange,
  tripeiro,
}: RegisterTripeiroPaymentDialogProps) {
  const { mutateAsync: addPayment, isPending } = useAddTripeiroPayment();

  const handleSubmit = async (data: TripeiroPaymentFormData) => {
    if (!tripeiro) return;

    // Get user's team ID from profile
    const { data: profileData } = await supabase
      .from('profiles')
      .select('id_equipe')
      .eq('id', (await supabase.auth.getUser()).data.user?.id)
      .single();

    if (!profileData?.id_equipe) {
      return;
    }

    await addPayment({
      id_tripeiro: tripeiro.id,
      id_equipe: profileData.id_equipe,
      data_pagamento: data.data_pagamento,
      periodo_inicio: tripeiro.periodoInicio,
      periodo_fim: tripeiro.periodoFim,
      valor_a_receber: tripeiro.valorAReceber,
      valor_pago: data.valor_pago,
      metodo_pagamento: data.metodo_pagamento,
      observacoes: data.observacoes,
    });

    onOpenChange(false);
  };

  if (!tripeiro) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pagamento - {tripeiro.nome}</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="text-sm text-muted-foreground mb-4">
            Valor a Receber: <span className="font-semibold">R$ {tripeiro.valorAReceber.toFixed(2)}</span>
          </div>
          <TripeiroPaymentForm
            onSubmit={handleSubmit}
            isSubmitting={isPending}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}


import { CreditCard, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyPaymentsStateProps {
  onAddClick: () => void;
}

export default function EmptyPaymentsState({ onAddClick }: EmptyPaymentsStateProps) {
  return (
    <div className="flex h-[400px] shrink-0 items-center justify-center rounded-md border border-dashed">
      <div className="mx-auto flex max-w-[420px] flex-col items-center justify-center text-center">
        <CreditCard className="h-10 w-10 text-muted-foreground" />
        <h3 className="mt-4 text-lg font-semibold">Nenhum pagamento registrado</h3>
        <p className="mt-2 text-sm text-muted-foreground">
          Ainda não existem pagamentos registrados. Adicione um novo pagamento para começar.
        </p>
        <Button onClick={onAddClick} className="mt-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          Novo Pagamento
        </Button>
      </div>
    </div>
  );
}

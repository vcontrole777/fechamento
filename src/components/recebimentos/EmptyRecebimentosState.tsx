
import { Button } from "@/components/ui/button";
import { Plus, Receipt } from "lucide-react";

interface EmptyRecebimentosStateProps {
  onNewRecebimento: () => void;
}

export function EmptyRecebimentosState({ onNewRecebimento }: EmptyRecebimentosStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <Receipt className="h-16 w-16 text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Nenhum recebimento encontrado</h3>
      <p className="text-muted-foreground mb-6 max-w-md">
        Comece registrando os recebimentos dos tripeiros para acompanhar os valores recebidos.
      </p>
      <Button onClick={onNewRecebimento} className="gap-2">
        <Plus className="h-4 w-4" />
        Novo Recebimento
      </Button>
    </div>
  );
}

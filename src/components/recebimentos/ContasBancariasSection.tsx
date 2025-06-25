
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useContasBancarias } from "@/hooks/useContasBancarias";
import { ContasBancariasTable } from "./ContasBancariasTable";
import { NovaContaBancariaDialog } from "./NovaContaBancariaDialog";

export function ContasBancariasSection() {
  const [showNovaContaDialog, setShowNovaContaDialog] = useState(false);
  const { data: contasBancarias = [], isLoading } = useContasBancarias();

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Contas Bancárias</CardTitle>
        <Button onClick={() => setShowNovaContaDialog(true)} size="sm">
          <Plus className="mr-2 h-4 w-4" />
          Nova Conta
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="text-muted-foreground">Carregando contas...</div>
          </div>
        ) : (
          <ContasBancariasTable contas={contasBancarias} />
        )}
      </CardContent>

      <NovaContaBancariaDialog
        open={showNovaContaDialog}
        onOpenChange={setShowNovaContaDialog}
      />
    </Card>
  );
}

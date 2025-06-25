
import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DateFilter } from "@/components/common/DateFilter";
import { useRecebimentos } from "@/hooks/useRecebimentos";
import { RecebimentosTable } from "@/components/recebimentos/RecebimentosTable";
import { RecebimentosFilters } from "@/components/recebimentos/RecebimentosFilters";
import { NovoRecebimentoDialog } from "@/components/recebimentos/NovoRecebimentoDialog";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";

export default function Recebimentos() {
  const [showNovoRecebimentoDialog, setShowNovoRecebimentoDialog] = useState(false);
  const [selectedTripeiroId, setSelectedTripeiroId] = useState<string>("all");
  
  const { dateRange } = useSharedDateFilter();
  
  const tripeiroIdForQuery = selectedTripeiroId === "all" ? undefined : parseInt(selectedTripeiroId);
  const { data: recebimentos = [], isLoading } = useRecebimentos(dateRange, tripeiroIdForQuery);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const totalRecebido = recebimentos.reduce((total, recebimento) => total + Number(recebimento.valor), 0);

  return (
    <div className="space-y-6 p-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Recebimentos</h1>
          <p className="text-muted-foreground">
            Gerencie os recebimentos dos tripeiros
          </p>
        </div>
        <Button onClick={() => setShowNovoRecebimentoDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Recebimento
        </Button>
      </div>

      <div className="flex flex-col lg:flex-row gap-4">
        <DateFilter 
          onFilterChange={() => {}}
        />
        <RecebimentosFilters
          selectedTripeiroId={selectedTripeiroId}
          onTripeiroChange={setSelectedTripeiroId}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Recebido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(totalRecebido)}
            </div>
            <p className="text-xs text-muted-foreground">
              {recebimentos.length} recebimento{recebimentos.length !== 1 ? 's' : ''}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Histórico de Recebimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="text-muted-foreground">Carregando recebimentos...</div>
            </div>
          ) : (
            <RecebimentosTable 
              recebimentos={recebimentos}
              formatCurrency={formatCurrency}
            />
          )}
        </CardContent>
      </Card>

      <NovoRecebimentoDialog
        open={showNovoRecebimentoDialog}
        onOpenChange={setShowNovoRecebimentoDialog}
      />
    </div>
  );
}

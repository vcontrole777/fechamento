
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { RecebimentosTable } from "@/components/recebimentos/RecebimentosTable";
import { NewRecebimentoDialog } from "@/components/recebimentos/NewRecebimentoDialog";
import { EditRecebimentoDialog } from "@/components/recebimentos/EditRecebimentoDialog";
import { DeleteRecebimentoDialog } from "@/components/recebimentos/DeleteRecebimentoDialog";
import { useRecebimentosDialogState } from "@/hooks/recebimentos/useRecebimentosDialogState";
import { useRecebimentosQuery } from "@/hooks/recebimentos/useRecebimentosQuery";
import { EmptyRecebimentosState } from "@/components/recebimentos/EmptyRecebimentosState";
import { DateFilter } from "@/components/common/DateFilter";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { RecebimentosStats } from "@/components/recebimentos/RecebimentosStats";

export default function Recebimentos() {
  const { dateRange, updateSharedDateFilter } = useSharedDateFilter();
  const { data: recebimentos = [], isLoading, error } = useRecebimentosQuery(dateRange);
  const {
    newDialogOpen,
    editDialogOpen,
    deleteDialogOpen,
    editingRecebimento,
    deletingRecebimento,
    openNewDialog,
    openEditDialog,
    openDeleteDialog,
    closeDialogs
  } = useRecebimentosDialogState();

  const handleDateFilterChange = (newDateRange: any, option: any) => {
    updateSharedDateFilter(newDateRange, option);
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Recebimentos</h1>
        </div>
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Recebimentos</h1>
        <Card>
          <CardContent className="pt-6">
            <p className="text-red-600">Erro ao carregar recebimentos: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Recebimentos</h1>
        <Button onClick={openNewDialog} className="gap-2">
          <Plus className="h-4 w-4" />
          Novo Recebimento
        </Button>
      </div>

      <DateFilter onFilterChange={handleDateFilterChange} />

      <RecebimentosStats recebimentos={recebimentos} />

      <Card>
        <CardHeader>
          <CardTitle>Lista de Recebimentos</CardTitle>
        </CardHeader>
        <CardContent>
          {recebimentos.length === 0 ? (
            <EmptyRecebimentosState onNewRecebimento={openNewDialog} />
          ) : (
            <RecebimentosTable
              recebimentos={recebimentos}
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          )}
        </CardContent>
      </Card>

      <NewRecebimentoDialog
        open={newDialogOpen}
        onOpenChange={closeDialogs}
      />

      {editingRecebimento && (
        <EditRecebimentoDialog
          open={editDialogOpen}
          onOpenChange={closeDialogs}
          recebimento={editingRecebimento}
        />
      )}

      {deletingRecebimento && (
        <DeleteRecebimentoDialog
          open={deleteDialogOpen}
          onOpenChange={closeDialogs}
          recebimento={deletingRecebimento}
        />
      )}
    </div>
  );
}

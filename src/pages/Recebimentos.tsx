
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, Table, Building2, CreditCard } from "lucide-react";
import { RecebimentosTable } from "@/components/recebimentos/RecebimentosTable";
import { RecebimentosByAccount } from "@/components/recebimentos/RecebimentosByAccount";
import { NewRecebimentoDialog } from "@/components/recebimentos/NewRecebimentoDialog";
import { EditRecebimentoDialog } from "@/components/recebimentos/EditRecebimentoDialog";
import { DeleteRecebimentoDialog } from "@/components/recebimentos/DeleteRecebimentoDialog";
import { ContasBancariasTable } from "@/components/contas-bancarias/ContasBancariasTable";
import { NewContaBancariaDialog } from "@/components/contas-bancarias/NewContaBancariaDialog";
import { EditContaBancariaDialog } from "@/components/contas-bancarias/EditContaBancariaDialog";
import { DeleteContaBancariaDialog } from "@/components/contas-bancarias/DeleteContaBancariaDialog";
import { useRecebimentosDialogState } from "@/hooks/recebimentos/useRecebimentosDialogState";
import { useContasBancariasDialogState } from "@/hooks/contas-bancarias/useContasBancariasDialogState";
import { useRecebimentosQuery } from "@/hooks/recebimentos/useRecebimentosQuery";
import { useContasBancariasQuery } from "@/hooks/contas-bancarias/useContasBancariasQuery";
import { EmptyRecebimentosState } from "@/components/recebimentos/EmptyRecebimentosState";
import { DateFilter } from "@/components/common/DateFilter";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { RecebimentosStats } from "@/components/recebimentos/RecebimentosStats";

export default function Recebimentos() {
  const { dateRange, updateSharedDateFilter } = useSharedDateFilter();
  const { data: recebimentos = [], isLoading, error } = useRecebimentosQuery(dateRange);
  const { data: contas = [], isLoading: isLoadingContas } = useContasBancariasQuery();
  
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

  const {
    newDialogOpen: newContaDialogOpen,
    editDialogOpen: editContaDialogOpen,
    deleteDialogOpen: deleteContaDialogOpen,
    editingConta,
    deletingConta,
    openNewDialog: openNewContaDialog,
    openEditDialog: openEditContaDialog,
    openDeleteDialog: openDeleteContaDialog,
    closeDialogs: closeContaDialogs
  } = useContasBancariasDialogState();

  const handleDateFilterChange = (newDateRange: any, option: any) => {
    updateSharedDateFilter(newDateRange, option);
  };

  if (isLoading || isLoadingContas) {
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
          <CardTitle>Gestão de Recebimentos</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="recebimentos" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="recebimentos" className="flex items-center gap-2">
                <Table className="h-4 w-4" />
                Lista Completa
              </TabsTrigger>
              <TabsTrigger value="accounts" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Por Conta Bancária
              </TabsTrigger>
              <TabsTrigger value="contas" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                Contas Bancárias
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="recebimentos" className="mt-6">
              {recebimentos.length === 0 ? (
                <EmptyRecebimentosState onNewRecebimento={openNewDialog} />
              ) : (
                <RecebimentosTable
                  recebimentos={recebimentos}
                  onEdit={openEditDialog}
                  onDelete={openDeleteDialog}
                />
              )}
            </TabsContent>
            
            <TabsContent value="accounts" className="mt-6">
              <RecebimentosByAccount
                recebimentos={recebimentos}
                onEdit={openEditDialog}
                onDelete={openDeleteDialog}
              />
            </TabsContent>

            <TabsContent value="contas" className="mt-6">
              <div className="space-y-4">
                <div className="flex justify-end">
                  <Button onClick={openNewContaDialog} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nova Conta Bancária
                  </Button>
                </div>
                
                {contas.length === 0 ? (
                  <div className="text-center py-12">
                    <CreditCard className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhuma conta bancária cadastrada
                    </h3>
                    <p className="text-gray-600 mb-4">
                      Cadastre suas contas bancárias para facilitar o registro de recebimentos.
                    </p>
                    <Button onClick={openNewContaDialog}>
                      Cadastrar primeira conta
                    </Button>
                  </div>
                ) : (
                  <ContasBancariasTable
                    contas={contas}
                    onEdit={openEditContaDialog}
                    onDelete={openDeleteContaDialog}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
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

      <NewContaBancariaDialog
        open={newContaDialogOpen}
        onOpenChange={closeContaDialogs}
      />

      {editingConta && (
        <EditContaBancariaDialog
          open={editContaDialogOpen}
          onOpenChange={closeContaDialogs}
          conta={editingConta}
        />
      )}

      {deletingConta && (
        <DeleteContaBancariaDialog
          open={deleteContaDialogOpen}
          onOpenChange={closeContaDialogs}
          conta={deletingConta}
        />
      )}
    </div>
  );
}

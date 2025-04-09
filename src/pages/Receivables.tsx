
import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";
import { DateFilter } from "@/components/common/DateFilter";

import { useReceivables } from "@/hooks/useReceivables";
import { SummaryTab } from "@/components/receivables/SummaryTab";
import { DetailsTab } from "@/components/receivables/DetailsTab";
import { ReceiptDialog } from "@/components/receivables/ReceiptDialog";

export default function Receivables() {
  const { dateRange, updateSharedDateFilter } = useSharedDateFilter();
  const [currentTab, setCurrentTab] = useState<"summary" | "details">("summary");
  
  const {
    tripeiroSummaries,
    isLoading,
    refetch,
    selectedTripeiro,
    isReceiptDialogOpen,
    handleOpenReceiptDialog,
    handleCloseReceiptDialog,
    setIsReceiptDialogOpen
  } = useReceivables(dateRange);

  const handleDateFilterChange = (newDateRange, option) => {
    updateSharedDateFilter(newDateRange, option);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Recebimentos</h1>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
          <DateFilter onFilterChange={handleDateFilterChange} />
        </div>
      </div>

      <Tabs defaultValue="summary" value={currentTab} onValueChange={(value) => setCurrentTab(value as any)}>
        <TabsList>
          <TabsTrigger value="summary">Resumo</TabsTrigger>
          <TabsTrigger value="details">Detalhes</TabsTrigger>
        </TabsList>
        
        <TabsContent value="summary" className="mt-4">
          <SummaryTab 
            tripeiroSummaries={tripeiroSummaries}
            isLoading={isLoading}
            onRegisterReceipt={handleOpenReceiptDialog}
          />
        </TabsContent>
        
        <TabsContent value="details" className="mt-4">
          <DetailsTab 
            tripeiroSummaries={tripeiroSummaries}
            isLoading={isLoading}
            onRegisterReceipt={handleOpenReceiptDialog}
          />
        </TabsContent>
      </Tabs>

      <ReceiptDialog 
        isOpen={isReceiptDialogOpen}
        onClose={handleCloseReceiptDialog}
        tripeiro={selectedTripeiro}
        onSuccess={refetch}
      />
    </div>
  );
}

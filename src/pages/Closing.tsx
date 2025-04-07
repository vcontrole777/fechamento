
import { useEffect } from "react";
import { useClosingData } from "@/hooks/useClosingData";
import { ClosingSummary } from "@/components/closing/ClosingSummary";
import { TripeiroReceivablesTable } from "@/components/closing/TripeiroReceivablesTable";
import { AttendantCommissionsTable } from "@/components/closing/AttendantCommissionsTable";
import { CopyToWhatsAppButton } from "@/components/closing/CopyToWhatsAppButton";
import { DateFilter, DateFilterOption } from "@/components/common/DateFilter";
import { GeneratePDFButton } from "@/components/closing/GeneratePDFButton";
import { format } from "date-fns";
import { useSharedDateFilter } from "@/hooks/useSharedDateFilter";

export default function Closing() {
  const {
    isLoading,
    closingSummary,
    tripeiroSummaries,
    attendantSummaries,
    expenses,
    dateRange,
    updateDateRange,
  } = useClosingData();

  // Get shared date filter update function
  const { updateSharedDateFilter } = useSharedDateFilter();

  // Force refetch when component mounts
  useEffect(() => {
    // The query hooks already fetch data based on the dateRange
  }, []);

  // Format currency in Brazilian style (R$ 1.000,00)
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const handleDateFilterChange = (newDateRange, option: DateFilterOption) => {
    console.log("Date filter changed on Closing page:", {
      from: newDateRange.from ? format(newDateRange.from, 'yyyy-MM-dd') : null,
      to: newDateRange.to ? format(newDateRange.to, 'yyyy-MM-dd') : null,
      option
    });
    
    // Update both our local state and the shared state
    updateDateRange(newDateRange);
    updateSharedDateFilter(newDateRange, option);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Fechamento</h1>
        <div className="flex space-x-2">
          <GeneratePDFButton
            closingSummary={closingSummary}
            tripeiroSummaries={tripeiroSummaries}
            attendantSummaries={attendantSummaries}
            expenses={expenses}
            dateRange={dateRange}
            isLoading={isLoading}
            formatCurrency={formatCurrency}
          />
          <CopyToWhatsAppButton 
            closingSummary={closingSummary}
            tripeiroSummaries={tripeiroSummaries}
            attendantSummaries={attendantSummaries}
            expenses={expenses}
            dateRange={dateRange}
            isLoading={isLoading}
          />
        </div>
      </div>

      <div className="flex flex-col space-y-4">
        <div className="flex justify-between items-center">
          <DateFilter onFilterChange={handleDateFilterChange} />
        </div>
        
        <ClosingSummary 
          summary={closingSummary} 
          formatCurrency={formatCurrency} 
          isLoading={isLoading} 
        />
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Valores a Receber (Tripeiros)</h2>
          <TripeiroReceivablesTable 
            tripeiroSummaries={tripeiroSummaries} 
            formatCurrency={formatCurrency} 
          />
        </div>
        
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Comissões (Atendentes)</h2>
          <AttendantCommissionsTable 
            attendantSummaries={attendantSummaries} 
            formatCurrency={formatCurrency} 
          />
        </div>
      </div>
    </div>
  );
}

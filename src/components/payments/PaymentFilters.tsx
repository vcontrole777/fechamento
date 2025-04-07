
import { useEffect, useState } from "react";
import { Separator } from "@/components/ui/separator";
import { PaymentFilters } from "@/types/payment.types";
import { FilterPopover } from "./filters/FilterPopover";
import { ActiveFilters } from "./filters/ActiveFilters";

interface PaymentFiltersComponentProps {
  filters: PaymentFilters;
  onUpdateFilters: (filters: Partial<PaymentFilters>) => void;
}

export function PaymentFiltersComponent({
  filters,
  onUpdateFilters,
}: PaymentFiltersComponentProps) {
  const [selectedAttendantIds, setSelectedAttendantIds] = useState<number[]>(filters.attendantIds);
  const [selectedTripeiroIds, setSelectedTripeiroIds] = useState<number[]>(filters.tripeiroIds);
  const [selectedStatuses, setSelectedStatuses] = useState<("concluido" | "pendente" | "bloqueado")[]>(filters.statuses);

  // Apply filters when selection changes
  useEffect(() => {
    onUpdateFilters({
      attendantIds: selectedAttendantIds,
      tripeiroIds: selectedTripeiroIds,
      statuses: selectedStatuses,
    });
  }, [selectedAttendantIds, selectedTripeiroIds, selectedStatuses, onUpdateFilters]);

  const clearFilters = () => {
    setSelectedAttendantIds([]);
    setSelectedTripeiroIds([]);
    setSelectedStatuses([]);
  };

  const hasActiveFilters = selectedAttendantIds.length > 0 || selectedTripeiroIds.length > 0 || selectedStatuses.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <FilterPopover
          filters={filters}
          selectedAttendantIds={selectedAttendantIds}
          selectedTripeiroIds={selectedTripeiroIds}
          selectedStatuses={selectedStatuses}
          setSelectedAttendantIds={setSelectedAttendantIds}
          setSelectedTripeiroIds={setSelectedTripeiroIds}
          setSelectedStatuses={setSelectedStatuses}
          clearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {hasActiveFilters && (
          <ActiveFilters
            selectedAttendantIds={selectedAttendantIds}
            selectedTripeiroIds={selectedTripeiroIds}
            selectedStatuses={selectedStatuses}
            setSelectedAttendantIds={setSelectedAttendantIds}
            setSelectedTripeiroIds={setSelectedTripeiroIds}
            setSelectedStatuses={setSelectedStatuses}
            clearFilters={clearFilters}
          />
        )}
      </div>
      {hasActiveFilters && (
        <Separator className="my-2" />
      )}
    </div>
  );
}

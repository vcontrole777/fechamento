
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface ActiveFiltersProps {
  selectedAttendantIds: number[];
  selectedTripeiroIds: number[];
  selectedStatuses: ("concluido" | "pendente" | "bloqueado")[];
  setSelectedAttendantIds: (ids: number[]) => void;
  setSelectedTripeiroIds: (ids: number[]) => void;
  setSelectedStatuses: (statuses: ("concluido" | "pendente" | "bloqueado")[]) => void;
  clearFilters: () => void;
}

export function ActiveFilters({
  selectedAttendantIds,
  selectedTripeiroIds,
  selectedStatuses,
  setSelectedAttendantIds,
  setSelectedTripeiroIds,
  setSelectedStatuses,
  clearFilters,
}: ActiveFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {selectedAttendantIds.length > 0 && (
        <Badge variant="secondary" className="rounded-md">
          {selectedAttendantIds.length} atendente{selectedAttendantIds.length > 1 ? "s" : ""}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => setSelectedAttendantIds([])}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      {selectedTripeiroIds.length > 0 && (
        <Badge variant="secondary" className="rounded-md">
          {selectedTripeiroIds.length} tripeiro{selectedTripeiroIds.length > 1 ? "s" : ""}
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => setSelectedTripeiroIds([])}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      {selectedStatuses.length > 0 && (
        <Badge variant="secondary" className="rounded-md">
          {selectedStatuses.length} status
          <Button
            variant="ghost"
            size="icon"
            className="h-4 w-4 ml-1 p-0"
            onClick={() => setSelectedStatuses([])}
          >
            <X className="h-3 w-3" />
          </Button>
        </Badge>
      )}
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs"
        onClick={clearFilters}
      >
        Limpar todos
      </Button>
    </div>
  );
}

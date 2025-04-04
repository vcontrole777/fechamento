
import { useState } from "react";
import { Check, Filter, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { PaymentFilters } from "@/hooks/usePayments";
import { useAttendantsAndTripeiros } from "../hooks/useAttendantsAndTripeiros";
import { statusOptions } from "../constants/statusOptions";
import { cn } from "@/lib/utils";

interface FilterPopoverProps {
  filters: PaymentFilters;
  selectedAttendantIds: number[];
  selectedTripeiroIds: number[];
  selectedStatuses: ("concluido" | "pendente" | "bloqueado")[];
  setSelectedAttendantIds: (ids: number[]) => void;
  setSelectedTripeiroIds: (ids: number[]) => void;
  setSelectedStatuses: (statuses: ("concluido" | "pendente" | "bloqueado")[]) => void;
  clearFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterPopover({
  filters,
  selectedAttendantIds,
  selectedTripeiroIds,
  selectedStatuses,
  setSelectedAttendantIds,
  setSelectedTripeiroIds,
  setSelectedStatuses,
  clearFilters,
  hasActiveFilters,
}: FilterPopoverProps) {
  const { attendants, tripeiros } = useAttendantsAndTripeiros();
  const [open, setOpen] = useState(false);

  const handleAttendantSelection = (id: number) => {
    setSelectedAttendantIds(
      selectedAttendantIds.includes(id) 
        ? selectedAttendantIds.filter((value) => value !== id) 
        : [...selectedAttendantIds, id]
    );
  };

  const handleTripeiroSelection = (id: number) => {
    setSelectedTripeiroIds(
      selectedTripeiroIds.includes(id) 
        ? selectedTripeiroIds.filter((value) => value !== id) 
        : [...selectedTripeiroIds, id]
    );
  };

  const handleStatusSelection = (value: "concluido" | "pendente" | "bloqueado") => {
    setSelectedStatuses(
      selectedStatuses.includes(value) 
        ? selectedStatuses.filter((status) => status !== value) 
        : [...selectedStatuses, value]
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" className="h-10 border-dashed">
          <Filter className="mr-2 h-4 w-4" />
          Filtros
          {hasActiveFilters && (
            <Badge variant="secondary" className="ml-2 rounded-sm px-1 font-normal lg:hidden">
              {selectedAttendantIds.length + selectedTripeiroIds.length + selectedStatuses.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0" align="start">
        <Command>
          <CommandInput placeholder="Buscar..." />
          <CommandList>
            <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
            <CommandGroup heading="Atendentes">
              {attendants.map((attendant) => (
                <CommandItem
                  key={`attendant-${attendant.id}`}
                  onSelect={() => handleAttendantSelection(attendant.id)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedAttendantIds.includes(attendant.id)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <span>{attendant.nome}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Tripeiros">
              {tripeiros.map((tripeiro) => (
                <CommandItem
                  key={`tripeiro-${tripeiro.id}`}
                  onSelect={() => handleTripeiroSelection(tripeiro.id)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedTripeiroIds.includes(tripeiro.id)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <span>{tripeiro.nome}</span>
                </CommandItem>
              ))}
            </CommandGroup>
            <CommandSeparator />
            <CommandGroup heading="Status">
              {statusOptions.map((status) => (
                <CommandItem
                  key={`status-${status.value}`}
                  onSelect={() => handleStatusSelection(status.value)}
                >
                  <div
                    className={cn(
                      "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                      selectedStatuses.includes(status.value)
                        ? "bg-primary text-primary-foreground"
                        : "opacity-50 [&_svg]:invisible"
                    )}
                  >
                    <Check className="h-4 w-4" />
                  </div>
                  <span>{status.label}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <div className="flex items-center justify-between p-2">
            <p className="text-sm text-muted-foreground">
              {hasActiveFilters ? (
                <>
                  {selectedAttendantIds.length + selectedTripeiroIds.length + selectedStatuses.length} filtros ativos
                </>
              ) : (
                "Sem filtros"
              )}
            </p>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                className="h-auto p-2"
                onClick={() => clearFilters()}
              >
                Limpar
                <X className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

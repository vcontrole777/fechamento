
import { useEffect, useState } from "react";
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
import { cn } from "@/lib/utils";
import { useAttendantsAndTripeiros } from "./hooks/useAttendantsAndTripeiros";
import { Separator } from "@/components/ui/separator";

// Define the status options with proper typing
const statusOptions = [
  { label: "Pendente", value: "pendente" as const },
  { label: "Concluído", value: "concluido" as const },
  { label: "Bloqueado", value: "bloqueado" as const },
];

interface PaymentFiltersComponentProps {
  filters: PaymentFilters;
  onUpdateFilters: (filters: Partial<PaymentFilters>) => void;
}

export function PaymentFiltersComponent({
  filters,
  onUpdateFilters,
}: PaymentFiltersComponentProps) {
  const { attendants, tripeiros } = useAttendantsAndTripeiros();
  const [open, setOpen] = useState(false);

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

  const handleAttendantSelection = (id: number) => {
    setSelectedAttendantIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const handleTripeiroSelection = (id: number) => {
    setSelectedTripeiroIds((current) =>
      current.includes(id) ? current.filter((value) => value !== id) : [...current, id]
    );
  };

  const handleStatusSelection = (value: "concluido" | "pendente" | "bloqueado") => {
    setSelectedStatuses((current) =>
      current.includes(value) ? current.filter((status) => status !== value) : [...current, value]
    );
  };

  const clearFilters = () => {
    setSelectedAttendantIds([]);
    setSelectedTripeiroIds([]);
    setSelectedStatuses([]);
  };

  const hasActiveFilters = selectedAttendantIds.length > 0 || selectedTripeiroIds.length > 0 || selectedStatuses.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
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

        {hasActiveFilters && (
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
        )}
      </div>
      {hasActiveFilters && (
        <Separator className="my-2" />
      )}
    </div>
  );
}

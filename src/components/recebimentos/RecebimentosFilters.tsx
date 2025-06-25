
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useTripeiros } from "@/hooks/useTripeiros";

interface RecebimentosFiltersProps {
  selectedTripeiroId: string;
  onTripeiroChange: (value: string) => void;
}

export function RecebimentosFilters({ 
  selectedTripeiroId, 
  onTripeiroChange 
}: RecebimentosFiltersProps) {
  const { data: tripeiros = [] } = useTripeiros();

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <div className="flex-1">
        <Select value={selectedTripeiroId} onValueChange={onTripeiroChange}>
          <SelectTrigger className="w-full sm:w-[200px]">
            <SelectValue placeholder="Todos os tripeiros" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos os tripeiros</SelectItem>
            {tripeiros.map((tripeiro) => (
              <SelectItem key={tripeiro.id} value={tripeiro.id.toString()}>
                {tripeiro.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Filter } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export const EXPENSE_CATEGORIES = [
  { value: 'alimentacao', label: 'Alimentação', color: 'bg-orange-500' },
  { value: 'transporte', label: 'Transporte', color: 'bg-blue-500' },
  { value: 'equipamento', label: 'Equipamento', color: 'bg-purple-500' },
  { value: 'marketing', label: 'Marketing', color: 'bg-pink-500' },
  { value: 'software', label: 'Software', color: 'bg-cyan-500' },
  { value: 'manutencao', label: 'Manutenção', color: 'bg-yellow-500' },
  { value: 'outros', label: 'Outros', color: 'bg-gray-500' },
];

interface ExpenseFiltersProps {
  selectedCategories: string[];
  onCategoriesChange: (categories: string[]) => void;
  selectedResponsaveis: number[];
  onResponsaveisChange: (responsaveis: number[]) => void;
  responsaveis: Array<{ id: number; nome: string }>;
}

export function ExpenseFilters({
  selectedCategories,
  onCategoriesChange,
  selectedResponsaveis,
  onResponsaveisChange,
  responsaveis,
}: ExpenseFiltersProps) {
  const activeFiltersCount = selectedCategories.length + selectedResponsaveis.length;

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  };

  const toggleResponsavel = (responsavelId: number) => {
    if (selectedResponsaveis.includes(responsavelId)) {
      onResponsaveisChange(selectedResponsaveis.filter(r => r !== responsavelId));
    } else {
      onResponsaveisChange([...selectedResponsaveis, responsavelId]);
    }
  };

  const clearFilters = () => {
    onCategoriesChange([]);
    onResponsaveisChange([]);
  };

  return (
    <div className="flex items-center gap-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-2">
            <Filter className="h-4 w-4" />
            Filtros
            {activeFiltersCount > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {activeFiltersCount}
              </Badge>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64 bg-background z-50">
          <DropdownMenuLabel>Categorias</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {EXPENSE_CATEGORIES.map((category) => (
            <DropdownMenuCheckboxItem
              key={category.value}
              checked={selectedCategories.includes(category.value)}
              onCheckedChange={() => toggleCategory(category.value)}
            >
              <div className="flex items-center gap-2">
                <div className={`h-3 w-3 rounded-full ${category.color}`} />
                {category.label}
              </div>
            </DropdownMenuCheckboxItem>
          ))}

          {responsaveis.length > 0 && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>Responsáveis</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {responsaveis.map((responsavel) => (
                <DropdownMenuCheckboxItem
                  key={responsavel.id}
                  checked={selectedResponsaveis.includes(responsavel.id)}
                  onCheckedChange={() => toggleResponsavel(responsavel.id)}
                >
                  {responsavel.nome}
                </DropdownMenuCheckboxItem>
              ))}
            </>
          )}

          {activeFiltersCount > 0 && (
            <>
              <DropdownMenuSeparator />
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="w-full"
              >
                Limpar filtros
              </Button>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {activeFiltersCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="h-8 px-2 lg:px-3"
        >
          Limpar
        </Button>
      )}
    </div>
  );
}

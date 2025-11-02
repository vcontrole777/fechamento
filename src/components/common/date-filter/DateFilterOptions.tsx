
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateFilterOptionsProps } from "./types";

export function DateFilterOptions({ handleOptionSelect }: DateFilterOptionsProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 gap-1">
          <span>Período</span>
          <ChevronDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[180px]">
        <DropdownMenuItem onClick={() => handleOptionSelect("all")}>
          Todo o Período
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleOptionSelect("today")}>
          Hoje
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleOptionSelect("yesterday")}>
          Ontem
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleOptionSelect("last7days")}>
          Últimos 7 dias
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleOptionSelect("last15days")}>
          Últimos 15 dias
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleOptionSelect("last30days")}>
          Últimos 30 dias
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => handleOptionSelect("custom")}>
          Personalizado
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

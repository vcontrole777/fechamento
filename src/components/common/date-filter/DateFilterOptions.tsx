
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DateFilterOption, DateFilterOptionsProps } from "./types";
import { dateFilterPillClasses } from "./utils";

const PRIMARY_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: "today", label: "Hoje" },
  { value: "last7days", label: "7d" },
  { value: "last15days", label: "15d" },
  { value: "last30days", label: "30d" },
];

const OVERFLOW_OPTIONS: { value: DateFilterOption; label: string }[] = [
  { value: "all", label: "Todo o Período" },
  { value: "yesterday", label: "Ontem" },
];

export function DateFilterOptions({ selectedOption, handleOptionSelect }: DateFilterOptionsProps) {
  const isOverflowActive = OVERFLOW_OPTIONS.some((o) => o.value === selectedOption);

  return (
    <>
      {PRIMARY_OPTIONS.map((option) => (
        <button
          key={option.value}
          type="button"
          onClick={() => handleOptionSelect(option.value)}
          className={dateFilterPillClasses(selectedOption === option.value)}
        >
          {option.label}
        </button>
      ))}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button type="button" className={dateFilterPillClasses(isOverflowActive)}>
            <MoreHorizontal className="h-3.5 w-3.5" />
            <span className="sr-only">Mais opções de período</span>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[160px]">
          {OVERFLOW_OPTIONS.map((option) => (
            <DropdownMenuItem key={option.value} onClick={() => handleOptionSelect(option.value)}>
              {option.label}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
}

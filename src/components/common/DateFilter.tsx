
import { useState, useEffect } from "react";
import { CalendarIcon, ChevronDown } from "lucide-react";
import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export type DateFilterOption = 
  | "today" 
  | "yesterday" 
  | "last7days" 
  | "last15days" 
  | "last30days" 
  | "custom";

export type DateRange = { from: Date; to?: Date };

interface DateFilterProps {
  onFilterChange: (dateRange: DateRange, option: DateFilterOption) => void;
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  const [date, setDate] = useState<DateRange>({
    from: startOfDay(new Date()),
    to: endOfDay(new Date()),
  });
  const [selectedOption, setSelectedOption] = useState<DateFilterOption>("today");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Notify parent component when date range changes
    onFilterChange(date, selectedOption);
  }, [date, selectedOption, onFilterChange]);

  const handleOptionSelect = (option: DateFilterOption) => {
    setSelectedOption(option);
    
    const today = new Date();
    
    switch (option) {
      case "today":
        setDate({
          from: startOfDay(today),
          to: endOfDay(today),
        });
        break;
      case "yesterday":
        const yesterday = subDays(today, 1);
        setDate({
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        });
        break;
      case "last7days":
        setDate({
          from: startOfDay(subDays(today, 6)),
          to: endOfDay(today),
        });
        break;
      case "last15days":
        setDate({
          from: startOfDay(subDays(today, 14)),
          to: endOfDay(today),
        });
        break;
      case "last30days":
        setDate({
          from: startOfDay(subDays(today, 29)),
          to: endOfDay(today),
        });
        break;
      case "custom":
        // Keep current date range for custom option
        setOpen(true);
        break;
    }
  };

  // Format the date range for display
  const formatDateRange = () => {
    if (selectedOption === "today") return "Hoje";
    if (selectedOption === "yesterday") return "Ontem";
    if (selectedOption === "last7days") return "Últimos 7 dias";
    if (selectedOption === "last15days") return "Últimos 15 dias";
    if (selectedOption === "last30days") return "Últimos 30 dias";
    
    if (date.from) {
      if (date.to) {
        return `${format(date.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(date.to, "dd/MM/yyyy", { locale: ptBR })}`;
      }
      return format(date.from, "dd/MM/yyyy", { locale: ptBR });
    }
    return "Selecione um período";
  };

  return (
    <div className="flex items-center space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="h-8 gap-1">
            <span>Período</span>
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-[180px]">
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

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="h-8 justify-start text-left font-normal w-[230px]"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {formatDateRange()}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date.from}
            selected={date}
            onSelect={(range) => {
              if (range) {
                // Make sure we set the full day range (beginning to end of day)
                const newRange = {
                  from: range.from ? startOfDay(range.from) : startOfDay(new Date()),
                  to: range.to ? endOfDay(range.to) : undefined,
                };
                setDate(newRange);
                setSelectedOption("custom");
              }
            }}
            numberOfMonths={2}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

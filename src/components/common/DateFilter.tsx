
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

export type DateRange = { from: Date | null; to?: Date | null };

interface DateFilterProps {
  onFilterChange: (dateRange: DateRange, option: DateFilterOption) => void;
}

export function DateFilter({ onFilterChange }: DateFilterProps) {
  // Create today date at beginning of day
  const today = startOfDay(new Date());
  
  const [date, setDate] = useState<DateRange>({
    from: today,
    to: endOfDay(today),
  });
  const [selectedOption, setSelectedOption] = useState<DateFilterOption>("today");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Notify parent component when date range changes
    onFilterChange(date, selectedOption);
  }, [date, selectedOption, onFilterChange]);

  const handleOptionSelect = (option: DateFilterOption) => {
    setSelectedOption(option);
    
    // Always use current time for calculations
    const currentDate = new Date();
    const todayStart = startOfDay(currentDate);
    const todayEnd = endOfDay(currentDate);
    
    switch (option) {
      case "today":
        setDate({
          from: todayStart,
          to: todayEnd,
        });
        break;
      case "yesterday":
        const yesterday = subDays(currentDate, 1);
        setDate({
          from: startOfDay(yesterday),
          to: endOfDay(yesterday),
        });
        break;
      case "last7days":
        setDate({
          from: startOfDay(subDays(currentDate, 6)),
          to: todayEnd,
        });
        break;
      case "last15days":
        setDate({
          from: startOfDay(subDays(currentDate, 14)),
          to: todayEnd,
        });
        break;
      case "last30days":
        setDate({
          from: startOfDay(subDays(currentDate, 29)),
          to: todayEnd,
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
            defaultMonth={date.from || undefined}
            selected={date as any}
            onSelect={(range) => {
              if (range) {
                // Preserve the full day boundaries (start and end of day)
                const newRange = {
                  from: range.from ? startOfDay(range.from) : null,
                  to: range.to ? endOfDay(range.to) : null
                };
                
                console.log("Calendar selected date range:", {
                  from: newRange.from ? format(newRange.from, 'yyyy-MM-dd') : null,
                  to: newRange.to ? format(newRange.to, 'yyyy-MM-dd') : null,
                });
                
                setDate(newRange);
                setSelectedOption("custom");
              }
            }}
            numberOfMonths={2}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>
    </div>
  );
}

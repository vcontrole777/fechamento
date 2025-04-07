
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { CalendarIcon } from "lucide-react";
import { format, startOfDay, endOfDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarPopoverProps } from "./types";

export function CalendarPopover({ 
  open, 
  setOpen, 
  date, 
  setDate, 
  setSelectedOption,
  formatDateRange 
}: CalendarPopoverProps) {
  return (
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
          selected={date.from && date.to ? { from: date.from, to: date.to } : undefined}
          onSelect={(range) => {
            if (range) {
              // For single day selection, set both from and to to the same day
              // This ensures proper filtering for a single day
              const newRange = {
                from: range.from ? startOfDay(range.from) : null,
                to: range.to ? endOfDay(range.to) : (range.from ? endOfDay(range.from) : null)
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
  );
}

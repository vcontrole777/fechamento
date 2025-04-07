
import * as React from "react"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { addDays, format, startOfDay, endOfDay } from "date-fns"
import { ptBR } from "date-fns/locale"

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: startOfDay(new Date()),
    to: endOfDay(addDays(new Date(), 30)),
  })

  const formatDateDisplay = (date: Date) => {
    // Ensure consistent date formatting
    try {
      return format(date, "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Error formatting date:", error, date);
      return "Data inválida";
    }
  }

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            className={cn(
              "w-full justify-start text-left font-normal",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {formatDateDisplay(date.from)} -{" "}
                  {formatDateDisplay(date.to)}
                </>
              ) : (
                formatDateDisplay(date.from)
              )
            ) : (
              <span>Selecione o período</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            initialFocus
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={(selectedDate) => {
              if (selectedDate) {
                console.log("Selected date range:", selectedDate);
                
                const newRange = {
                  from: selectedDate.from ? startOfDay(selectedDate.from) : null,
                  to: selectedDate.to ? endOfDay(selectedDate.to) : null,
                };
                
                console.log("Normalized date range:", newRange);
                setDate(newRange);
              } else {
                setDate(undefined);
              }
            }}
            numberOfMonths={2}
            locale={ptBR}
            className="pointer-events-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}


import { format, startOfDay, endOfDay, subDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { DateFilterOption, DateRange } from "./types";

export function formatDateRangeDisplay(
  selectedOption: DateFilterOption,
  date: DateRange
): string {
  if (selectedOption === "all") return "Todo o Período";
  if (selectedOption === "today") return "Hoje";
  if (selectedOption === "yesterday") return "Ontem";
  if (selectedOption === "last7days") return "Últimos 7 dias";
  if (selectedOption === "last15days") return "Últimos 15 dias";
  if (selectedOption === "last30days") return "Últimos 30 dias";
  
  if (date.from) {
    if (date.to) {
      // If same date (single day selection), show only one date
      if (format(date.from, "yyyy-MM-dd") === format(date.to, "yyyy-MM-dd")) {
        return format(date.from, "dd/MM/yyyy", { locale: ptBR });
      }
      return `${format(date.from, "dd/MM/yyyy", { locale: ptBR })} - ${format(date.to, "dd/MM/yyyy", { locale: ptBR })}`;
    }
    return format(date.from, "dd/MM/yyyy", { locale: ptBR });
  }
  return "Selecione um período";
}

export function getDateRangeFromOption(option: DateFilterOption): DateRange {
  // Always use current time for calculations
  const currentDate = new Date();
  const todayStart = startOfDay(currentDate);
  const todayEnd = endOfDay(currentDate);
  
  switch (option) {
    case "all":
      return {
        from: null,
        to: null,
      };
    case "today":
      return {
        from: todayStart,
        to: todayEnd,
      };
    case "yesterday":
      const yesterday = subDays(currentDate, 1);
      return {
        from: startOfDay(yesterday),
        to: endOfDay(yesterday),
      };
    case "last7days":
      return {
        from: startOfDay(subDays(currentDate, 6)),
        to: todayEnd,
      };
    case "last15days":
      return {
        from: startOfDay(subDays(currentDate, 14)),
        to: todayEnd,
      };
    case "last30days":
      return {
        from: startOfDay(subDays(currentDate, 29)),
        to: todayEnd,
      };
    case "custom":
    default:
      // For custom, we keep the existing date range
      return {
        from: null,
        to: null
      };
  }
}

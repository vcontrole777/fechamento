import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Analisa uma data sem deixar o fuso horario deslocar o dia: strings
// YYYY-MM-DD sao interpretadas no horario local, nao em UTC.
export function parseLocalDate(value: string | Date | null | undefined): Date | undefined {
  if (!value) return undefined;
  if (value instanceof Date) return value;

  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day, 12, 0, 0, 0);
  }

  return new Date(value);
}

export function formatLocalDate(value: string | Date, pattern = "dd/MM/yyyy"): string {
  const date = parseLocalDate(value);
  return date ? format(date, pattern, { locale: ptBR }) : "";
}

export function toISODateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

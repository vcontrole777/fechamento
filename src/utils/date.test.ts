import { describe, it, expect } from "vitest";
import { parseLocalDate, formatLocalDate, toISODateString } from "./date";

describe("parseLocalDate", () => {
  it("string YYYY-MM-DD: nao desloca pra o dia anterior/seguinte por fuso", () => {
    const date = parseLocalDate("2026-03-15")!;
    expect(date.getFullYear()).toBe(2026);
    expect(date.getMonth()).toBe(2); // marco, 0-indexado
    expect(date.getDate()).toBe(15);
  });

  it("instancia de Date: retorna a mesma instancia", () => {
    const original = new Date(2026, 5, 1);
    expect(parseLocalDate(original)).toBe(original);
  });

  it("string ISO com horario: usa o parse padrao", () => {
    const date = parseLocalDate("2026-03-15T10:00:00Z")!;
    expect(date instanceof Date).toBe(true);
    expect(Number.isNaN(date.getTime())).toBe(false);
  });

  it("undefined/null: retorna undefined", () => {
    expect(parseLocalDate(undefined)).toBeUndefined();
    expect(parseLocalDate(null)).toBeUndefined();
  });
});

describe("formatLocalDate", () => {
  it("formata YYYY-MM-DD como dd/MM/yyyy por padrao", () => {
    expect(formatLocalDate("2026-03-15")).toBe("15/03/2026");
  });

  it("aceita um pattern customizado", () => {
    expect(formatLocalDate("2026-03-15", "dd/MM/yy")).toBe("15/03/26");
  });
});

describe("toISODateString", () => {
  it("formata uma Date como YYYY-MM-DD", () => {
    expect(toISODateString(new Date(2026, 2, 15))).toBe("2026-03-15");
  });
});

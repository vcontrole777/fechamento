import { describe, it, expect } from "vitest";
import { formatBrazilianCurrency, formatCurrency } from "./currency";

describe("formatBrazilianCurrency", () => {
  it("formata com virgula decimal e ponto de milhar, sem simbolo", () => {
    expect(formatBrazilianCurrency(1234.5)).toBe("1.234,50");
  });

  it("sempre mostra 2 casas decimais", () => {
    expect(formatBrazilianCurrency(10)).toBe("10,00");
  });
});

describe("formatCurrency", () => {
  it("inclui o simbolo R$", () => {
    expect(formatCurrency(1234.5)).toBe("R$ 1.234,50");
  });
});

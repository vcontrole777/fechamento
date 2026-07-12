import { describe, it, expect } from "vitest";
import { derivePaymentStatus, paymentTableFor, workerIdColumnFor } from "./workerConfig";

describe("derivePaymentStatus", () => {
  it("nada pago: pendente", () => {
    expect(derivePaymentStatus(0, 100)).toBe("pendente");
  });

  it("pago parcial: menor que o devido", () => {
    expect(derivePaymentStatus(50, 100)).toBe("pago_parcial");
  });

  it("pago igual ao devido: pago_total", () => {
    expect(derivePaymentStatus(100, 100)).toBe("pago_total");
  });

  it("pago mais que o devido: pago_total", () => {
    expect(derivePaymentStatus(150, 100)).toBe("pago_total");
  });

  it("valor pago negativo: trata como pendente", () => {
    expect(derivePaymentStatus(-10, 100)).toBe("pendente");
  });
});

describe("paymentTableFor / workerIdColumnFor", () => {
  it("atendente mapeia pra pagamentos_atendentes / id_atendente", () => {
    expect(paymentTableFor("atendente")).toBe("pagamentos_atendentes");
    expect(workerIdColumnFor("atendente")).toBe("id_atendente");
  });

  it("tripeiro mapeia pra pagamentos_tripeiros / id_tripeiro", () => {
    expect(paymentTableFor("tripeiro")).toBe("pagamentos_tripeiros");
    expect(workerIdColumnFor("tripeiro")).toBe("id_tripeiro");
  });
});

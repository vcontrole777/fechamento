import { describe, it, expect } from "vitest";
import { splitCommissionCore, splitCommission } from "./commission";
import { Payment } from "@/types/payment.types";

function makePayment(overrides: Partial<Payment> = {}): Payment {
  return {
    id: 1,
    data: "2026-01-01",
    valor: 1000,
    tipo: "pix",
    status: "concluido",
    id_atendente: 1,
    id_tripeiro: 2,
    id_indicador: null,
    porcentagem_atendente: 30,
    porcentagem_tripeiro: 20,
    porcentagem_indicacao: 0,
    criado_em: "2026-01-01T00:00:00Z",
    id_equipe: 1,
    ...overrides,
  };
}

describe("splitCommissionCore", () => {
  it("sem indicador: o atendente fica com o pool inteiro", () => {
    const result = splitCommissionCore(1000, 20, 30, 0);
    expect(result.tripeiroCommission).toBeCloseTo(200);
    expect(result.tripeiroReceivable).toBeCloseTo(800);
    expect(result.attendantPool).toBeCloseTo(240);
    expect(result.attendantCommission).toBeCloseTo(240);
    expect(result.referralCommission).toBe(0);
    expect(result.netValue).toBeCloseTo(560);
  });

  it("com indicador: o pool e dividido entre atendente e indicador", () => {
    const result = splitCommissionCore(1000, 20, 30, 10);
    expect(result.attendantPool).toBeCloseTo(240);
    expect(result.referralCommission).toBeCloseTo(24);
    expect(result.attendantCommission).toBeCloseTo(216);
    expect(result.netValue).toBeCloseTo(560);
  });

  it("pctIndicacao omitido: trata como zero", () => {
    const result = splitCommissionCore(1000, 20, 30);
    expect(result.referralCommission).toBe(0);
    expect(result.attendantCommission).toBeCloseTo(240);
  });

  it("percentual do tripeiro zero: tripeiro nao recebe comissao", () => {
    const result = splitCommissionCore(1000, 0, 30, 0);
    expect(result.tripeiroCommission).toBe(0);
    expect(result.tripeiroReceivable).toBeCloseTo(1000);
    expect(result.attendantCommission).toBeCloseTo(300);
  });

  it("percentual do atendente zero: atendente nao recebe comissao", () => {
    const result = splitCommissionCore(1000, 20, 0, 0);
    expect(result.attendantPool).toBe(0);
    expect(result.attendantCommission).toBe(0);
    expect(result.netValue).toBeCloseTo(800);
  });

  it("valor do pagamento zero: todos os resultados zero, sem NaN", () => {
    const result = splitCommissionCore(0, 20, 30, 10);
    expect(result.tripeiroCommission).toBe(0);
    expect(result.tripeiroReceivable).toBe(0);
    expect(result.attendantPool).toBe(0);
    expect(result.attendantCommission).toBe(0);
    expect(result.referralCommission).toBe(0);
    expect(result.netValue).toBe(0);
    Object.values(result).forEach(value => expect(Number.isNaN(value)).toBe(false));
  });

  it("regressao numerica: caso conhecido calculado a mao", () => {
    // valor=1000, tripeiro 20%, atendente 30%, indicacao 10%
    // tripeiroCommission=200, tripeiroReceivable=800, attendantPool=240
    // referralCommission=24, attendantCommission=216, netValue=560
    const result = splitCommissionCore(1000, 20, 30, 10);
    expect(result).toEqual({
      tripeiroCommission: 200,
      tripeiroReceivable: 800,
      attendantPool: 240,
      attendantCommission: 216,
      referralCommission: 24,
      netValue: 560,
    });
  });
});

describe("splitCommission", () => {
  it("le os percentuais congelados diretamente do pagamento", () => {
    const payment = makePayment({ id_indicador: 5, porcentagem_indicacao: 10 });
    const result = splitCommission(payment);
    expect(result).toEqual(splitCommissionCore(1000, 20, 30, 10));
  });

  it("sem indicador (id_indicador null): porcentagem_indicacao congelada em zero", () => {
    const payment = makePayment({ id_indicador: null, porcentagem_indicacao: 0 });
    const result = splitCommission(payment);
    expect(result.referralCommission).toBe(0);
  });
});

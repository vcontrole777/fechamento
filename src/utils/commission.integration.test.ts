import { describe, it, expect } from "vitest";
import { splitCommission } from "./commission";
import { calculateFinancialStats } from "./dashboardCalculations";
import { usePaymentCalculations } from "@/hooks/payments/usePaymentCalculations";
import { useClosingCalculations } from "@/hooks/closing/useClosingCalculations";
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
    id_indicador: 99,
    porcentagem_atendente: 30,
    porcentagem_tripeiro: 20,
    porcentagem_indicacao: 10,
    criado_em: "2026-01-01T00:00:00Z",
    id_equipe: 1,
    atendente: { id: 1, nome: "Ana", porcentagem: 30 },
    tripeiro: { id: 2, nome: "Bruno", porcentagem: 20 },
    ...overrides,
  };
}

describe("todos os call sites concordam com splitCommission para o mesmo pagamento", () => {
  const payment = makePayment();
  const expected = splitCommission(payment);

  it("usePaymentCalculations", () => {
    const { calculateTotals } = usePaymentCalculations();
    const totals = calculateTotals([payment]);
    expect(totals.totalAttendantCommission).toBeCloseTo(expected.attendantCommission, 10);
    expect(totals.totalTripeiroReceivable).toBeCloseTo(expected.tripeiroReceivable, 10);
    expect(totals.totalReferralCommission).toBeCloseTo(expected.referralCommission, 10);
    expect(totals.netTotal).toBeCloseTo(expected.netValue, 10);
  });

  it("useClosingCalculations.calculateClosingSummary", () => {
    const { calculateClosingSummary } = useClosingCalculations();
    const summary = calculateClosingSummary([payment], []);
    expect(summary.totalTripeiroCommission).toBeCloseTo(expected.tripeiroCommission, 10);
    expect(summary.totalAttendantCommission).toBeCloseTo(expected.attendantCommission, 10);
    expect(summary.totalReferralCommission).toBeCloseTo(expected.referralCommission, 10);
  });

  it("useClosingCalculations.calculateAttendantSummaries (atribui a comissao de indicacao ao indicador)", () => {
    const { calculateAttendantSummaries } = useClosingCalculations();
    const summaries = calculateAttendantSummaries([payment], [{ id: 99, nome: "Indicador", porcentagem: 25 }]);

    const ownSummary = summaries.find(a => a.id === payment.id_atendente);
    expect(ownSummary?.totalCommission).toBeCloseTo(expected.attendantCommission, 10);

    const referrerSummary = summaries.find(a => a.id === 99);
    expect(referrerSummary?.totalReferralCommission).toBeCloseTo(expected.referralCommission, 10);
  });

  it("useClosingCalculations.calculateTripeiroSummaries", () => {
    const { calculateTripeiroSummaries } = useClosingCalculations();
    const summaries = calculateTripeiroSummaries([payment]);
    const summary = summaries.find(t => t.id === payment.id_tripeiro);
    expect(summary?.totalReceivable).toBeCloseTo(expected.tripeiroReceivable, 10);
  });

  it("dashboardCalculations.calculateFinancialStats", () => {
    const stats = calculateFinancialStats([payment], []);
    expect(stats.commissions.tripeiro).toBeCloseTo(expected.tripeiroCommission, 10);
    expect(stats.commissions.atendente).toBeCloseTo(expected.attendantCommission, 10);
    expect(stats.commissions.referral).toBeCloseTo(expected.referralCommission, 10);
    expect(stats.netProfit).toBeCloseTo(
      payment.valor - expected.tripeiroCommission - expected.attendantCommission - expected.referralCommission,
      10
    );
  });
});

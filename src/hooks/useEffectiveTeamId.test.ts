import { describe, it, expect } from "vitest";
import { resolveEffectiveTeamId } from "./useEffectiveTeamId";

describe("resolveEffectiveTeamId", () => {
  it("usuário comum (não admin, não visualizando outra equipe): usa a própria equipe", () => {
    expect(resolveEffectiveTeamId(7, false, null)).toBe(7);
  });

  it("admin visualizando outra equipe: usa a equipe visualizada", () => {
    expect(resolveEffectiveTeamId(7, true, 42)).toBe(42);
  });

  it("admin com isViewingAsTeam true mas sem viewingTeamId: cai para a própria equipe", () => {
    expect(resolveEffectiveTeamId(7, true, null)).toBe(7);
  });

  it("própria equipe ainda não resolvida (null): resultado é null", () => {
    expect(resolveEffectiveTeamId(null, false, null)).toBe(null);
  });
});

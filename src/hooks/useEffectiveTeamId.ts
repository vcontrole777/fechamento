import { useAuth } from "@/hooks/useAuth";
import { useTeamView } from "@/contexts/TeamViewContext";

export function resolveEffectiveTeamId(
  ownTeamId: number | null,
  isViewingAsTeam: boolean,
  viewingTeamId: number | null
): number | null {
  return isViewingAsTeam && viewingTeamId ? viewingTeamId : ownTeamId;
}

// Equipe a usar em leituras: a equipe visualizada, se um admin estiver
// impersonando outra equipe; senao, a propria equipe do usuario. Escritas
// nunca usam isto - usam sempre ownTeamId (useAuth), pois "visualizar como
// equipe" e somente leitura.
export function useEffectiveTeamId(): number | null {
  const { ownTeamId } = useAuth();
  const { isViewingAsTeam, viewingTeamId } = useTeamView();
  return resolveEffectiveTeamId(ownTeamId, isViewingAsTeam, viewingTeamId);
}

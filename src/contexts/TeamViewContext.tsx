import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useAdminAuth } from "@/hooks/useAdminAuth";

interface TeamViewContextType {
  viewingTeamId: number | null;
  viewingTeamName: string | null;
  setViewingTeam: (teamId: number | null, teamName: string | null) => void;
  clearViewingTeam: () => void;
  isViewingAsTeam: boolean;
}

const TeamViewContext = createContext<TeamViewContextType>({
  viewingTeamId: null,
  viewingTeamName: null,
  setViewingTeam: () => {},
  clearViewingTeam: () => {},
  isViewingAsTeam: false,
});

export const useTeamView = () => useContext(TeamViewContext);

export function TeamViewProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAdminAuth();
  const [viewingTeamId, setViewingTeamId] = useState<number | null>(null);
  const [viewingTeamName, setViewingTeamName] = useState<string | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    if (isAdmin) {
      const savedTeamId = localStorage.getItem("admin_viewing_team_id");
      const savedTeamName = localStorage.getItem("admin_viewing_team_name");
      
      if (savedTeamId) {
        setViewingTeamId(parseInt(savedTeamId));
        setViewingTeamName(savedTeamName);
      }
    }
  }, [isAdmin]);

  const setViewingTeam = (teamId: number | null, teamName: string | null) => {
    if (!isAdmin) return;
    
    setViewingTeamId(teamId);
    setViewingTeamName(teamName);
    
    if (teamId) {
      localStorage.setItem("admin_viewing_team_id", teamId.toString());
      if (teamName) {
        localStorage.setItem("admin_viewing_team_name", teamName);
      }
    } else {
      localStorage.removeItem("admin_viewing_team_id");
      localStorage.removeItem("admin_viewing_team_name");
    }
  };

  const clearViewingTeam = () => {
    setViewingTeam(null, null);
  };

  return (
    <TeamViewContext.Provider
      value={{
        viewingTeamId,
        viewingTeamName,
        setViewingTeam,
        clearViewingTeam,
        isViewingAsTeam: isAdmin && viewingTeamId !== null,
      }}
    >
      {children}
    </TeamViewContext.Provider>
  );
}

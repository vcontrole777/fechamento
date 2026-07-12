import { useTeamView } from "@/contexts/TeamViewContext";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Eye, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function TeamViewBanner() {
  const { isViewingAsTeam, viewingTeamName, clearViewingTeam } = useTeamView();
  const navigate = useNavigate();

  if (!isViewingAsTeam) return null;

  const handleExitViewMode = () => {
    clearViewingTeam();
    navigate("/");
  };

  return (
    <Alert className="rounded-none border-x-0 border-t-0 bg-amber-500/10 border-amber-500/20">
      <Eye className="h-4 w-4 text-amber-600" />
      <AlertDescription className="flex items-center justify-between">
        <span className="text-sm font-medium">
          Visualizando como equipe: <strong>{viewingTeamName}</strong>
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExitViewMode}
          className="ml-4 h-7 text-xs"
        >
          <X className="h-3 w-3 mr-1" />
          Voltar para minha equipe
        </Button>
      </AlertDescription>
    </Alert>
  );
}

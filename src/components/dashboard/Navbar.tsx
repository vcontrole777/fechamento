
import { useEffect, useState } from "react";
import ThemeToggle from "@/components/ThemeToggle";
import { NavbarUserMenu } from "@/components/NavbarUserMenu";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Command, CommandInput } from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export function Navbar({ onToggleSidebar }: NavbarProps) {
  const { user } = useAuth();
  const [equipeName, setEquipeName] = useState<string>("");

  useEffect(() => {
    const fetchEquipe = async () => {
      if (user) {
        // Primeiro busca o id_equipe do perfil
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("id_equipe")
          .eq("id", user.id)
          .single();

        if (profileError) {
          console.error("Erro ao buscar perfil:", profileError);
          return;
        }

        if (profileData?.id_equipe) {
          // Depois busca o nome da equipe
          const { data: equipeData, error: equipeError } = await supabase
            .from("equipes")
            .select("nome")
            .eq("id", profileData.id_equipe)
            .single();

          if (equipeError) {
            console.error("Erro ao buscar equipe:", equipeError);
            return;
          }

          if (equipeData) {
            setEquipeName(equipeData.nome);
          }
        }
      }
    };

    fetchEquipe();
  }, [user]);

  return (
    <header className="sticky top-0 z-40 border-b bg-background">
      <div className="flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {onToggleSidebar && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleSidebar}
              className="md:hidden"
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}
          <Command className="rounded-lg border px-4 max-w-[320px]">
            <CommandInput placeholder="Buscar..." className="h-9 border-0 w-[280px] px-1" />
          </Command>
        </div>
        <div className="flex items-center space-x-4">
          {equipeName && (
            <div className="hidden md:block">
              <p className="text-sm font-medium">{equipeName}</p>
            </div>
          )}
          <ThemeToggle />
          <NavbarUserMenu />
        </div>
      </div>
    </header>
  );
}

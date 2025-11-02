
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Shield, Settings, Database } from "lucide-react";
import { ProfileSection } from "@/components/account/ProfileSection";
import { SecuritySection } from "@/components/account/SecuritySection";
import { PreferencesSection } from "@/components/account/PreferencesSection";
import { DataSection } from "@/components/account/DataSection";

export default function AccountPage() {
  const { toast } = useToast();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [teamId, setTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [role, setRole] = useState('');

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('nome, id_equipe, role')
          .eq('id', user.id)
          .single();

        if (profileError) throw profileError;

        if (profile) {
          setName(profile.nome || '');
          setEmail(user.email || '');
          setTeamId(profile.id_equipe?.toString() || '');
          setRole(profile.role || 'user');

          if (profile.id_equipe) {
            const { data: team } = await supabase
              .from('equipes')
              .select('nome')
              .eq('id', profile.id_equipe)
              .single();

            if (team) {
              setTeamName(team.nome || '');
            }
          }
        }
      } catch (error: any) {
        toast({
          title: "Erro ao carregar perfil",
          description: error.message,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [user, toast]);

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex justify-center items-center min-h-[400px]">
          <div className="animate-pulse text-muted-foreground">Carregando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Minha Conta</h1>
        <p className="text-muted-foreground">
          Gerencie suas informações, segurança e preferências
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="profile" className="gap-2">
            <User className="h-4 w-4" />
            <span className="hidden sm:inline">Perfil</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden sm:inline">Segurança</span>
          </TabsTrigger>
          <TabsTrigger value="preferences" className="gap-2">
            <Settings className="h-4 w-4" />
            <span className="hidden sm:inline">Preferências</span>
          </TabsTrigger>
          <TabsTrigger value="data" className="gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Dados</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <ProfileSection 
            name={name}
            email={email}
            teamId={teamId}
            teamName={teamName}
            role={role}
          />
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <SecuritySection />
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <PreferencesSection />
        </TabsContent>

        <TabsContent value="data" className="space-y-6">
          <DataSection teamId={teamId} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

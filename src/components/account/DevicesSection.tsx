import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Monitor, Smartphone, Tablet, LogOut, MapPin, Clock } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Session = {
  id: string;
  created_at: string;
  updated_at: string;
  user_agent?: string;
  ip?: string;
};

export function DevicesSection() {
  const { toast } = useToast();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      
      if (currentSession) {
        setCurrentSessionId(currentSession.access_token);
      }

      // Note: Supabase doesn't expose all sessions via the client API
      // We'll show the current session and a message about other sessions
      const mockSessions: Session[] = currentSession ? [{
        id: currentSession.access_token.slice(0, 20),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_agent: navigator.userAgent,
        ip: "Oculto por segurança"
      }] : [];

      setSessions(mockSessions);
    } catch (error: any) {
      toast({
        title: "Erro ao carregar sessões",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDeviceIcon = (userAgent?: string) => {
    if (!userAgent) return <Monitor className="h-5 w-5" />;
    
    const ua = userAgent.toLowerCase();
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      return <Smartphone className="h-5 w-5" />;
    }
    if (ua.includes('tablet') || ua.includes('ipad')) {
      return <Tablet className="h-5 w-5" />;
    }
    return <Monitor className="h-5 w-5" />;
  };

  const getDeviceInfo = (userAgent?: string) => {
    if (!userAgent) return { name: "Dispositivo Desconhecido", browser: "Navegador Desconhecido" };
    
    const ua = userAgent.toLowerCase();
    let name = "Desktop";
    let browser = "Navegador";

    // Detect device
    if (ua.includes('mobile') || ua.includes('android') || ua.includes('iphone')) {
      name = "Celular";
    } else if (ua.includes('tablet') || ua.includes('ipad')) {
      name = "Tablet";
    }

    // Detect browser
    if (ua.includes('chrome') && !ua.includes('edg')) {
      browser = "Chrome";
    } else if (ua.includes('firefox')) {
      browser = "Firefox";
    } else if (ua.includes('safari') && !ua.includes('chrome')) {
      browser = "Safari";
    } else if (ua.includes('edg')) {
      browser = "Edge";
    }

    // Detect OS
    let os = "";
    if (ua.includes('windows')) {
      os = "Windows";
    } else if (ua.includes('mac')) {
      os = "macOS";
    } else if (ua.includes('linux')) {
      os = "Linux";
    } else if (ua.includes('android')) {
      os = "Android";
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      os = "iOS";
    }

    return { name: `${name}${os ? ` - ${os}` : ""}`, browser };
  };

  const handleSignOutDevice = async (sessionId: string) => {
    try {
      // Sign out from current session
      await supabase.auth.signOut();
      
      toast({
        title: "Sessão encerrada",
        description: "Você foi desconectado com sucesso",
      });
      
      // Redirect to login
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: "Erro ao encerrar sessão",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOutAllDevices = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Todas as sessões encerradas",
        description: "Você foi desconectado de todos os dispositivos",
      });
      
      // Redirect to login
      window.location.href = '/auth';
    } catch (error: any) {
      toast({
        title: "Erro ao encerrar sessões",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Dispositivos Conectados</CardTitle>
          <CardDescription>Carregando...</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dispositivos Conectados</CardTitle>
        <CardDescription>
          Gerencie os dispositivos onde você está conectado
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {sessions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Nenhuma sessão ativa</p>
        ) : (
          <>
            {sessions.map((session) => {
              const deviceInfo = getDeviceInfo(session.user_agent);
              const isCurrentSession = session.id === currentSessionId.slice(0, 20);

              return (
                <div
                  key={session.id}
                  className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex gap-4">
                    <div className="mt-1">
                      {getDeviceIcon(session.user_agent)}
                    </div>
                    <div className="space-y-2 flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{deviceInfo.name}</h4>
                        {isCurrentSession && (
                          <Badge variant="secondary" className="text-xs">
                            Dispositivo atual
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Monitor className="h-3 w-3" />
                          <span>{deviceInfo.browser}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span>{session.ip || "Localização oculta"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3" />
                          <span>
                            Último acesso: {format(new Date(session.updated_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleSignOutDevice(session.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Desconectar
                  </Button>
                </div>
              );
            })}

            {sessions.length > 1 && (
              <div className="pt-4 border-t">
                <Button
                  variant="destructive"
                  onClick={handleSignOutAllDevices}
                  className="w-full"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Desconectar de todos os dispositivos
                </Button>
              </div>
            )}
          </>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            <strong>Nota:</strong> Por questões de segurança, apenas a sessão atual é exibida. 
            Para desconectar de todos os dispositivos, use o botão acima.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
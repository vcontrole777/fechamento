import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Settings, Bell, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";
import { Badge } from "@/components/ui/badge";

export function PreferencesSection() {
  const { theme, setTheme } = useTheme();

  const themes = [
    { value: 'binance' as const, label: 'Binance', icon: Sun, description: 'Tema amarelo vibrante' },
    { value: 'terminal' as const, label: 'Terminal', icon: Moon, description: 'Tema verde matrix' },
    { value: 'glassmorphism' as const, label: 'Glass', icon: Settings, description: 'Tema roxo glassmorphism' },
    { value: 'monochrome' as const, label: 'Mono', icon: Moon, description: 'Tema preto e branco' },
  ];

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          <CardTitle>Preferências</CardTitle>
        </div>
        <CardDescription>Personalize sua experiência no sistema</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Theme Selection */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4 text-muted-foreground" />
              <Label>Tema do Sistema</Label>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {themes.map((themeOption) => {
              const Icon = themeOption.icon;
              return (
                <button
                  key={themeOption.value}
                  onClick={() => setTheme(themeOption.value)}
                  className={`p-3 border-2 rounded-lg transition-all text-left ${
                    theme === themeOption.value 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="h-4 w-4" />
                    <p className="text-sm font-medium">{themeOption.label}</p>
                  </div>
                  <p className="text-xs text-muted-foreground">{themeOption.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Notifications (placeholder for future implementation) */}
        <div className="space-y-4 pt-4 border-t">
          <div className="flex items-center gap-2 mb-2">
            <Bell className="h-4 w-4 text-muted-foreground" />
            <Label>Notificações</Label>
            <Badge variant="secondary" className="ml-2">Em breve</Badge>
          </div>
          
          <div className="space-y-3 opacity-50 pointer-events-none">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Notificações por Email</Label>
                <p className="text-xs text-muted-foreground">
                  Receba atualizações importantes por email
                </p>
              </div>
              <Switch disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Resumo Semanal</Label>
                <p className="text-xs text-muted-foreground">
                  Relatório semanal de pagamentos e despesas
                </p>
              </div>
              <Switch disabled />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Alertas de Vencimento</Label>
                <p className="text-xs text-muted-foreground">
                  Avisos sobre pagamentos pendentes
                </p>
              </div>
              <Switch disabled />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

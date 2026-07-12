import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  BarChart3,
  CircleDollarSign,
  Users,
  Truck,
  Receipt,
  FileBarChart,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Banknote,
  Shield,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";
import ThemeSelector from "@/components/ThemeSelector";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut, isAdmin } = useAuth();

  const menuItems = [
    { name: "Painel", icon: BarChart3, path: "/" },
    { name: "Pagamentos", icon: CircleDollarSign, path: "/pagamentos" },
    { name: "Atendentes", icon: Users, path: "/atendentes" },
    { name: "Tripeiros", icon: Truck, path: "/tripeiros" },
    { name: "Despesas", icon: Receipt, path: "/despesas" },
    { name: "Fechamento", icon: FileBarChart, path: "/fechamento" },
    { name: "Minha Conta", icon: User, path: "/minha-conta" },
  ];

  const adminItems = [
    { name: "Admin", icon: Shield, path: "/admin" },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Logout realizado",
        description: "Você saiu da sua conta com sucesso.",
      });
    } catch (error) {
      toast({
        title: "Erro ao sair",
        description: "Ocorreu um erro ao tentar sair.",
        variant: "destructive",
      });
    }
  };

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 bg-sidebar text-sidebar-foreground border-r border-border",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-border">
        {!collapsed && (
          <h2 className="text-xl font-bold glow-text">FECHAMENTO<span className="text-accent">.PRO</span></h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          className="ml-auto text-sidebar-foreground"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      <nav className="flex-1 py-6 overflow-y-auto">
        <ul className="space-y-1 px-2">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  cn(
                    "flex items-center px-3 py-2 rounded-md transition-colors border-l-2",
                    isActive
                      ? "bg-primary/10 text-primary border-primary"
                      : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-primary border-transparent"
                  )
                }
              >
                <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                {!collapsed && <span>{item.name}</span>}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Admin Section */}
      {isAdmin && (
        <div className="px-2 py-4 border-t border-border">
          {!collapsed && (
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest px-3 mb-2">
              Administração
            </p>
          )}
          <ul className="space-y-1">
            {adminItems.map((item) => (
              <li key={item.name}>
                <NavLink
                  to={item.path}
                  className={({ isActive }) =>
                    cn(
                      "flex items-center px-3 py-2 rounded-md transition-colors border",
                      isActive
                        ? "bg-primary/20 text-primary border-primary glow-border"
                        : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-primary border-transparent hover:border-primary/50"
                    )
                  }
                >
                  <item.icon className={cn("h-5 w-5", collapsed ? "mx-auto" : "mr-3")} />
                  {!collapsed && <span>{item.name}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="p-4 border-t border-border space-y-2">
        <div className={cn("flex items-center", collapsed ? "justify-center" : "justify-end")}>
          <ThemeSelector />
        </div>
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-muted hover:text-destructive hover:border-destructive border border-transparent transition-all",
            collapsed && "justify-center"
          )}
          onClick={handleSignOut}
        >
          <LogOut className="h-5 w-5" />
          {!collapsed && <span>Sair</span>}
        </Button>
      </div>
    </aside>
  );
}

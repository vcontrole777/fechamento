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
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth"; 
import { useUserRole } from "@/hooks/useUserRole";
import { toast } from "@/hooks/use-toast";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin } = useUserRole();

  const baseMenuItems = [
    { name: "Painel", icon: BarChart3, path: "/" },
    { name: "Pagamentos", icon: CircleDollarSign, path: "/pagamentos" },
    { name: "Atendentes", icon: Users, path: "/atendentes" },
    { name: "Tripeiros", icon: Truck, path: "/tripeiros" },
    { name: "Despesas", icon: Receipt, path: "/despesas" },
    { name: "Recebimentos", icon: Banknote, path: "/recebimentos" },
    { name: "Fechamento", icon: FileBarChart, path: "/fechamento" },
  ];

  const adminMenuItem = { name: "Administração", icon: Settings, path: "/admin" };
  const accountMenuItem = { name: "Minha Conta", icon: User, path: "/minha-conta" };

  const menuItems = [
    ...baseMenuItems,
    ...(isAdmin ? [adminMenuItem] : []),
    accountMenuItem,
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
        "flex flex-col h-screen transition-all duration-300 bg-sidebar text-sidebar-foreground",
        collapsed ? "w-16" : "w-64",
        className
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b border-sidebar-muted">
        {!collapsed && (
          <h2 className="text-xl font-bold">Startup<span className="text-accent">OPS</span></h2>
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
                    "flex items-center px-3 py-2 rounded-md transition-colors",
                    isActive
                      ? "bg-sidebar-muted text-accent"
                      : "text-sidebar-foreground hover:bg-sidebar-muted hover:text-sidebar-foreground"
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

      <div className="p-4 border-t border-sidebar-muted">
        <Button
          variant="ghost"
          className={cn(
            "w-full flex items-center gap-2 text-sidebar-foreground hover:bg-sidebar-muted",
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

import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  Truck,
  Receipt,
  FileText,
  User,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Shield,
  Settings,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { toast } from "@/hooks/use-toast";
import ThemeSelector from "@/components/ThemeSelector";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const { signOut } = useAuth();
  const { isAdmin } = useAdminAuth();

  const menuItems = [
    { name: "Painel", icon: LayoutDashboard, path: "/" },
    { name: "Pagamentos", icon: CreditCard, path: "/pagamentos" },
    { name: "Atendentes", icon: Users, path: "/atendentes" },
    { name: "Tripeiros", icon: Truck, path: "/tripeiros" },
    { name: "Despesas", icon: Receipt, path: "/despesas" },
    { name: "Fechamento", icon: FileText, path: "/fechamento" },
  ];

  const bottomItems = [
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

  const NavItem = ({ item }: { item: typeof menuItems[0] }) => (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
          isActive
            ? "bg-sidebar-accent/10 text-sidebar-accent"
            : "text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-muted"
        )
      }
    >
      {({ isActive }) => (
        <>
          <div className={cn(
            "flex items-center justify-center w-9 h-9 rounded-lg transition-colors",
            isActive
              ? "bg-sidebar-accent text-sidebar-background"
              : "bg-sidebar-muted group-hover:bg-sidebar-border"
          )}>
            <item.icon className="h-[18px] w-[18px]" />
          </div>
          {!collapsed && (
            <span className="font-medium text-sm">{item.name}</span>
          )}
        </>
      )}
    </NavLink>
  );

  return (
    <aside
      className={cn(
        "flex flex-col h-screen transition-all duration-300 bg-sidebar border-r border-sidebar-border",
        collapsed ? "w-[76px]" : "w-64",
        className
      )}
    >
      {/* Logo */}
      <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
        {!collapsed ? (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <span className="text-white font-bold text-sm">F</span>
            </div>
            <div className="flex flex-col">
              <span className="font-semibold text-sidebar-foreground text-sm leading-tight">
                Fechamento
              </span>
              <span className="text-[10px] text-sidebar-muted-foreground uppercase tracking-wider">
                Pro
              </span>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center mx-auto">
            <span className="text-white font-bold text-sm">F</span>
          </div>
        )}
      </div>

      {/* Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-sidebar-muted border border-sidebar-border flex items-center justify-center text-sidebar-muted-foreground hover:text-sidebar-foreground hover:bg-sidebar-border transition-colors"
      >
        {collapsed ? (
          <ChevronRight className="h-3.5 w-3.5" />
        ) : (
          <ChevronLeft className="h-3.5 w-3.5" />
        )}
      </button>

      {/* Main Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto">
        {!collapsed && (
          <p className="text-[11px] font-medium text-sidebar-muted-foreground uppercase tracking-wider px-3 mb-3">
            Menu
          </p>
        )}
        <ul className="space-y-1">
          {menuItems.map((item) => (
            <li key={item.name}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>

        {/* Admin Section */}
        {isAdmin && (
          <div className="mt-6">
            {!collapsed && (
              <p className="text-[11px] font-medium text-sidebar-muted-foreground uppercase tracking-wider px-3 mb-3">
                Administração
              </p>
            )}
            <ul className="space-y-1">
              {adminItems.map((item) => (
                <li key={item.name}>
                  <NavItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-1">
        {bottomItems.map((item) => (
          <NavItem key={item.name} item={item} />
        ))}

        <div className={cn(
          "flex items-center gap-2 mt-3 pt-3 border-t border-sidebar-border",
          collapsed ? "flex-col" : "justify-between"
        )}>
          <ThemeSelector />
          <Button
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn(
              "text-sidebar-muted-foreground hover:text-destructive hover:bg-destructive/10",
              !collapsed && "flex-1 justify-start gap-2"
            )}
            onClick={handleSignOut}
          >
            <LogOut className="h-4 w-4" />
            {!collapsed && <span>Sair</span>}
          </Button>
        </div>
      </div>
    </aside>
  );
}

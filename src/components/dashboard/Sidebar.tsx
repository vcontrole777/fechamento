
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  CreditCard,
  Users,
  UserCheck,
  Receipt,
  DollarSign,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  User
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Pagamentos", href: "/pagamentos", icon: CreditCard },
  { name: "Atendentes", href: "/atendentes", icon: Users },
  { name: "Tripeiros", href: "/tripeiros", icon: UserCheck },
  { name: "Despesas", href: "/despesas", icon: Receipt },
  { name: "Recebimentos", href: "/recebimentos", icon: DollarSign },
  { name: "Fechamento", href: "/fechamento", icon: BarChart3 },
  { name: "Minha Conta", href: "/minha-conta", icon: User },
];

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div
      className={cn(
        "flex flex-col bg-gray-900 text-white transition-all duration-300",
        collapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between p-4">
        {!collapsed && (
          <div>
            <h1 className="text-xl font-bold">Sistema</h1>
            <Badge variant="secondary" className="mt-1 text-xs">
              v1.0
            </Badge>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="text-white hover:bg-gray-800"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      <nav className="flex-1 px-2 py-4 space-y-2">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <NavLink
              key={item.name}
              to={item.href}
              className={cn(
                "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                isActive
                  ? "bg-gray-800 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white",
                collapsed ? "justify-center" : "justify-start"
              )}
              title={collapsed ? item.name : undefined}
            >
              <item.icon className={cn("h-5 w-5", !collapsed && "mr-3")} />
              {!collapsed && item.name}
            </NavLink>
          );
        })}
      </nav>
    </div>
  );
}

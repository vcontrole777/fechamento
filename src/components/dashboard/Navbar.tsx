
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Bell, Settings } from "lucide-react";
import ThemeToggle from "@/components/ThemeToggle";
import { DateRangePicker } from "@/components/DateRangePicker";

export function Navbar() {
  return (
    <header className="sticky top-0 z-30 h-16 border-b bg-background">
      <div className="flex items-center justify-between h-full px-4 md:px-6">
        <div className="flex-1">
          <h1 className="text-lg font-semibold md:text-2xl">Painel de Controle</h1>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:block w-72">
            <DateRangePicker />
          </div>

          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
            <span className="sr-only">Notifications</span>
          </Button>

          <ThemeToggle />
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar>
                  <AvatarImage src="" alt="user" />
                  <AvatarFallback className="bg-primary">MB</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <User className="w-4 h-4 mr-2" />
                <span>Perfil</span>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Settings className="w-4 h-4 mr-2" />
                <span>Configurações</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <LogOut className="w-4 h-4 mr-2" />
                <span>Sair</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}

// Importing at the bottom to avoid circular import issues
import { User, LogOut } from "lucide-react";

import { useState } from "react";
import { Check, UserPlus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useResponsaveis } from "./hooks/useResponsaveis";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ResponsavelComboboxProps {
  value?: number;
  onChange: (value: number | undefined) => void;
}

export function ResponsavelCombobox({ value, onChange }: ResponsavelComboboxProps) {
  const [open, setOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const { data: responsaveis = [], refetch } = useResponsaveis();
  const [isCreating, setIsCreating] = useState(false);

  const selectedResponsavel = responsaveis.find((r) => r.id === value);

  const handleCreateNew = async () => {
    if (!searchValue.trim()) return;
    
    setIsCreating(true);
    try {
      // Get user's team ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data: profileData } = await supabase
        .from("profiles")
        .select("id_equipe")
        .eq("id", user.id)
        .single();

      if (!profileData?.id_equipe) throw new Error("Equipe não encontrada");

      // Create new responsavel
      const { data: newResponsavel, error } = await supabase
        .from("pessoas")
        .insert({
          nome: searchValue.trim(),
          tipo: "atendente",
          id_equipe: profileData.id_equipe,
        })
        .select()
        .single();

      if (error) throw error;

      toast.success(`${searchValue} criado como novo responsável`);
      
      // Refetch list and select the new one
      await refetch();
      onChange(newResponsavel.id);
      setSearchValue("");
      setOpen(false);
    } catch (error) {
      console.error("Erro ao criar responsável:", error);
      toast.error("Erro ao criar responsável");
    } finally {
      setIsCreating(false);
    }
  };

  const filteredResponsaveis = responsaveis.filter((r) =>
    r.nome.toLowerCase().includes(searchValue.toLowerCase())
  );

  const showCreateOption = searchValue.trim() && filteredResponsaveis.length === 0;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedResponsavel ? selectedResponsavel.nome : "Selecione ou crie um responsável"}
          <UserPlus className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-full p-0" align="start">
        <Command shouldFilter={false}>
          <CommandInput
            placeholder="Buscar ou criar responsável..."
            value={searchValue}
            onValueChange={setSearchValue}
          />
          <CommandList>
            <CommandEmpty>
              {searchValue.trim() ? (
                <div className="py-6 text-center text-sm">
                  <p className="text-muted-foreground mb-2">Nenhum responsável encontrado</p>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  Digite para buscar ou criar
                </p>
              )}
            </CommandEmpty>
            
            {filteredResponsaveis.length > 0 && (
              <CommandGroup heading="Responsáveis">
                {filteredResponsaveis.map((responsavel) => (
                  <CommandItem
                    key={responsavel.id}
                    value={responsavel.id.toString()}
                    onSelect={() => {
                      onChange(responsavel.id === value ? undefined : responsavel.id);
                      setOpen(false);
                      setSearchValue("");
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === responsavel.id ? "opacity-100" : "opacity-0"
                      )}
                    />
                    {responsavel.nome}
                  </CommandItem>
                ))}
              </CommandGroup>
            )}

            {showCreateOption && (
              <CommandGroup>
                <CommandItem
                  onSelect={handleCreateNew}
                  disabled={isCreating}
                  className="text-primary"
                >
                  <UserPlus className="mr-2 h-4 w-4" />
                  {isCreating ? "Criando..." : `Criar "${searchValue}"`}
                </CommandItem>
              </CommandGroup>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

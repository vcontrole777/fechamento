
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

const RegisterForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [nomeEquipe, setNomeEquipe] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      console.log("Iniciando processo de registro");
      
      // 1. Criar a equipe primeiro
      console.log("Criando equipe:", nomeEquipe);
      const { data: equipeData, error: equipeError } = await supabase
        .from("equipes")
        .insert([{ nome: nomeEquipe }])
        .select('id')
        .single();

      if (equipeError) {
        console.error("Erro ao criar equipe:", equipeError);
        throw equipeError;
      }

      if (!equipeData) {
        console.error("Equipe criada, mas não retornou dados");
        throw new Error("Não foi possível criar a equipe");
      }

      const equipeId = equipeData.id;
      console.log("Equipe criada com id:", equipeId);

      // 2. Registrar o usuário com os metadados
      // Importante: Passamos o id_equipe como string, mas o trigger vai converter para integer
      console.log("Registrando usuário:", email);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nome,
            id_equipe: equipeId.toString(),
          },
        },
      });

      if (error) {
        console.error("Erro ao registrar usuário:", error);
        throw error;
      }

      if (!data.user) {
        console.error("Usuário criado, mas não retornou dados");
        throw new Error("Erro ao criar usuário");
      }

      // 3. Criar a pessoa associada ao usuário
      console.log("Criando pessoa para usuário:", data.user.id);
      const { error: pessoaError } = await supabase
        .from("pessoas")
        .insert([
          { 
            nome, 
            tipo: "responsavel", 
            id_usuario: data.user.id,
            id_equipe: equipeId
          }
        ]);

      if (pessoaError) {
        console.error("Erro ao criar pessoa:", pessoaError);
        throw pessoaError;
      }
      
      toast({
        title: "Registro realizado com sucesso",
        description: "Confira seu email para confirmar o cadastro.",
      });

    } catch (error: any) {
      console.error("Erro completo no registro:", error);
      toast({
        title: "Erro ao registrar",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <form onSubmit={handleRegister} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="nome">Seu Nome</Label>
        <Input 
          id="nome" 
          placeholder="Nome completo" 
          value={nome} 
          onChange={(e) => setNome(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nomeEquipe">Nome da Equipe</Label>
        <Input 
          id="nomeEquipe" 
          placeholder="Nome da sua equipe" 
          value={nomeEquipe} 
          onChange={(e) => setNomeEquipe(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registerEmail">Email</Label>
        <Input 
          id="registerEmail" 
          type="email" 
          placeholder="seu@email.com" 
          value={email} 
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="registerPassword">Senha</Label>
        <Input 
          id="registerPassword" 
          type="password" 
          placeholder="••••••••" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <Button type="submit" className="w-full" disabled={authLoading}>
        {authLoading ? "Registrando..." : "Registrar"}
      </Button>
    </form>
  );
};

export default RegisterForm;

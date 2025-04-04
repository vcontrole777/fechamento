
import React, { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";

const Auth = () => {
  const { session, loading } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [nome, setNome] = useState("");
  const [nomeEquipe, setNomeEquipe] = useState("");
  const [authLoading, setAuthLoading] = useState(false);

  // Se o usuário já estiver autenticado, redireciona para a página inicial
  if (session && !loading) {
    return <Navigate to="/" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      
      toast({
        title: "Login realizado com sucesso",
        description: "Bem-vindo de volta!",
      });
      
      navigate("/");
    } catch (error: any) {
      toast({
        title: "Erro ao fazer login",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAuthLoading(false);
    }
  };

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Flow Insight</CardTitle>
          <CardDescription className="text-center">
            Gerencie suas equipes e finanças de forma simples e eficiente
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="login" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-4">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="register">Registrar</TabsTrigger>
            </TabsList>
            
            <TabsContent value="login">
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="seu@email.com" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <Input 
                    id="password" 
                    type="password" 
                    placeholder="••••••••" 
                    value={password} 
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button type="submit" className="w-full" disabled={authLoading}>
                  {authLoading ? "Entrando..." : "Entrar"}
                </Button>
              </form>
            </TabsContent>
            
            <TabsContent value="register">
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
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <p className="text-sm text-center text-gray-500">
            Ao continuar, você concorda com nossos Termos de Serviço e Política de Privacidade
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;

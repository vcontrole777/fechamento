
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import AuthCard from "@/components/auth/AuthCard";

const Auth = () => {
  const { session, loading } = useAuth();

  // Se o usuário já estiver autenticado, redireciona para a página inicial
  if (session && !loading) {
    return <Navigate to="/" />;
  }

  return (
    <div className="relative flex items-center justify-center min-h-screen bg-background overflow-hidden p-4">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-grid-pattern opacity-20" 
           style={{
             backgroundImage: `
               linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
               linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
             `,
             backgroundSize: '50px 50px',
             animation: 'grid-scan 4s linear infinite'
           }} 
      />
      
      {/* Glowing orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="relative z-10">
        <AuthCard />
      </div>
    </div>
  );
};

export default Auth;

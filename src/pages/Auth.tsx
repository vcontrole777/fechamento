
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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 p-4">
      <AuthCard />
    </div>
  );
};

export default Auth;

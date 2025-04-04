
import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { session, loading } = useAuth();

  if (loading) {
    return <div className="flex h-screen items-center justify-center">Carregando...</div>;
  }

  if (!session) {
    return <Navigate to="/auth" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;

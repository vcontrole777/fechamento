
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFoundPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import Auth from "./pages/Auth";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";

// Create a new QueryClient instance inside the component
const App = () => {
  // Create a new client for every render to avoid shared state issues
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route
                element={
                  <ProtectedRoute>
                    <DashboardLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<Dashboard />} />
                <Route path="/pagamentos" element={<PlaceholderPage title="Pagamentos" />} />
                <Route path="/atendentes" element={<PlaceholderPage title="Atendentes" />} />
                <Route path="/tripeiros" element={<PlaceholderPage title="Tripeiros" />} />
                <Route path="/despesas" element={<PlaceholderPage title="Despesas" />} />
                <Route path="/fechamento" element={<PlaceholderPage title="Fechamento" />} />
                <Route path="/minha-conta" element={<PlaceholderPage title="Minha Conta" />} />
              </Route>
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;

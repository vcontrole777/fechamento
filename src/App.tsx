import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/hooks/useTheme";
import { DashboardLayout } from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFoundPage";
import PlaceholderPage from "./pages/PlaceholderPage";
import Auth from "./pages/Auth";
import { AuthProvider } from "./hooks/useAuth";
import ProtectedRoute from "./components/ProtectedRoute";
import Attendants from "./pages/Attendants";
import Tripeiros from "./pages/Tripeiros";
import Expenses from "./pages/Expenses";
import Payments from "./pages/Payments";
import Closing from "./pages/Closing";
import AccountPage from "./pages/AccountPage";
import Recebimentos from "./pages/Recebimentos";
import Admin from "./pages/Admin";

// Create a new QueryClient instance inside the component
const App = () => {
  // Create a new client for every render to avoid shared state issues
  const queryClient = new QueryClient();
  
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
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
                  <Route path="/pagamentos" element={<Payments />} />
                  <Route path="/atendentes" element={<Attendants />} />
                  <Route path="/tripeiros" element={<Tripeiros />} />
                  <Route path="/despesas" element={<Expenses />} />
                  <Route path="/recebimentos" element={<Recebimentos />} />
                  <Route path="/fechamento" element={<Closing />} />
                  <Route path="/minha-conta" element={<AccountPage />} />
                  <Route path="/admin" element={<Admin />} />
                </Route>
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;

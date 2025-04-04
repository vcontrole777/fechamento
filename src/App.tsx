
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { DashboardLayout } from "./layouts/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NotFoundPage from "./pages/NotFoundPage";
import PlaceholderPage from "./pages/PlaceholderPage";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route element={<DashboardLayout />}>
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
  </QueryClientProvider>
);

export default App;

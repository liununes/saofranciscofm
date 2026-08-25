import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { RadioProvider } from "./contexts/RadioContext";
import { AuthProvider } from "./hooks/useAuth";
import AnalyticsTracker from "./components/analytics/AnalyticsTracker";
import Index from "./pages/Index";
import Admin from "./pages/Admin";
import ResetPassword from "./pages/ResetPassword";
import NoticiaDetalhe from "./pages/NoticiaDetalhe";
import Sobre from "./pages/Sobre";
import Programacao from "./pages/Programacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <RadioProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnalyticsTracker />
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/sobre" element={<Sobre />} />
              <Route path="/programacao" element={<Programacao />} />
              <Route path="/noticia/:id" element={<NoticiaDetalhe />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/login" element={<Navigate to="/admin" replace />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </RadioProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

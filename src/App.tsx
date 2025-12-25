import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Modulos from "./pages/Modulos";
import Perfil from "./pages/Perfil";
import Configuracion from "./pages/Configuracion";
import Usuarios from "./pages/seguridad/Usuarios";
import Empresas from "./pages/seguridad/Empresas";
import Roles from "./pages/seguridad/Roles";
import Aplicaciones from "./pages/seguridad/Aplicaciones";
import SeguridadIndex from "./pages/seguridad/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <AppLayout>{children}</AppLayout>;
}

function AppRoutes() {
  const { isAuthenticated, isLoading } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
    <Routes>
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/modulos" element={<ProtectedRoute><Modulos /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
      <Route path="/seguridad" element={<ProtectedRoute><SeguridadIndex /></ProtectedRoute>} />
      <Route path="/seguridad/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
      <Route path="/seguridad/empresas" element={<ProtectedRoute><Empresas /></ProtectedRoute>} />
      <Route path="/seguridad/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
      <Route path="/seguridad/aplicaciones" element={<ProtectedRoute><Aplicaciones /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" storageKey="dnscloud-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

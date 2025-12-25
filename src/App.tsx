import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { PermissionsProvider } from "@/core/security/permissions";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppLayout } from "@/components/layout/AppLayout";
import { Loader2 } from "lucide-react";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Modulos from "./pages/Modulos";
import Perfil from "./pages/Perfil";
import Configuracion from "./pages/Configuracion";
// Importar páginas del módulo de Seguridad
import SeguridadIndex from "./modules/security/pages/Index";
import Usuarios from "./modules/security/pages/Usuarios";
import Empresas from "./modules/security/pages/Empresas";
import Roles from "./modules/security/pages/Roles";
import ModulosAdmin from "./modules/security/pages/Modulos";
// Importar páginas del módulo de RRHH
import RRHHIndex from "./modules/rrhh/pages/Index";
import RRHHEmpleados from "./modules/rrhh/pages/Empleados";
import RRHHAsistencia from "./modules/rrhh/pages/Asistencia";
// Legacy route (redirect)
import Empleados from "./modules/employees/pages/Empleados";
import ResetPassword from "./pages/ResetPassword";
import NotFound from "./pages/NotFound";
import Landing from "./pages/Landing";

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
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <Login />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/modulos" element={<ProtectedRoute><Modulos /></ProtectedRoute>} />
      <Route path="/perfil" element={<ProtectedRoute><Perfil /></ProtectedRoute>} />
      <Route path="/configuracion" element={<ProtectedRoute><Configuracion /></ProtectedRoute>} />
      {/* Rutas del módulo de Seguridad */}
      <Route path="/seguridad" element={<ProtectedRoute><SeguridadIndex /></ProtectedRoute>} />
      <Route path="/seguridad/usuarios" element={<ProtectedRoute><Usuarios /></ProtectedRoute>} />
      <Route path="/seguridad/empresas" element={<ProtectedRoute><Empresas /></ProtectedRoute>} />
      <Route path="/seguridad/roles" element={<ProtectedRoute><Roles /></ProtectedRoute>} />
      <Route path="/seguridad/modulos" element={<ProtectedRoute><ModulosAdmin /></ProtectedRoute>} />
      {/* Rutas del módulo de RRHH */}
      <Route path="/rrhh" element={<ProtectedRoute><RRHHIndex /></ProtectedRoute>} />
      <Route path="/rrhh/empleados" element={<ProtectedRoute><RRHHEmpleados /></ProtectedRoute>} />
      <Route path="/rrhh/asistencia" element={<ProtectedRoute><RRHHAsistencia /></ProtectedRoute>} />
      {/* Redirect legacy empleados route */}
      <Route path="/empleados" element={<Navigate to="/rrhh/empleados" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

function AppWithPermissions() {
  return (
    <PermissionsProvider>
      <AppRoutes />
    </PermissionsProvider>
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
            <AppWithPermissions />
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;

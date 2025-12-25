import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { PermissionsProvider } from "@/core/security/permissions";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AppRoutes } from "@/app/DynamicRoutes";

const queryClient = new QueryClient();

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

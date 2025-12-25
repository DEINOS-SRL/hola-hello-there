import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  Home, 
  Shield, 
  Users, 
  Building2, 
  Key, 
  AppWindow,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Moon,
  Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

const mainMenuItems = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Módulos', href: '/modulos', icon: LayoutGrid },
];

const securityMenuItems = [
  { name: 'Usuarios', href: '/seguridad/usuarios', icon: Users },
  { name: 'Empresas', href: '/seguridad/empresas', icon: Building2 },
  { name: 'Roles', href: '/seguridad/roles', icon: Key },
  { name: 'Aplicaciones', href: '/seguridad/aplicaciones', icon: AppWindow },
];

export function AppSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { isAdmin } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const location = useLocation();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

  const NavItem = ({ item }: { item: typeof mainMenuItems[0] }) => {
    const Icon = item.icon;
    const active = isActive(item.href);

    const content = (
      <NavLink
        to={item.href}
        className={cn(
          "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
          "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          active && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        {!collapsed && <span className="font-medium">{item.name}</span>}
      </NavLink>
    );

    if (collapsed) {
      return (
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right" className="font-medium">
            {item.name}
          </TooltipContent>
        </Tooltip>
      );
    }

    return content;
  };

  return (
    <aside 
      className={cn(
        "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 sticky top-0 h-screen",
        collapsed ? "w-[64px]" : "w-[260px]"
      )}
    >
      {/* Logo */}
      <div className="h-[60px] flex items-center justify-between px-3 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-sidebar-primary flex items-center justify-center shrink-0">
            <span className="text-sidebar-primary-foreground font-bold text-sm">DC</span>
          </div>
          {!collapsed && (
            <span className="font-semibold text-sidebar-foreground text-lg">DNSCloud</span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
          className="h-8 w-8 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent shrink-0"
        >
          {collapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-6 overflow-y-auto">
        {/* Main Menu */}
        <div className="space-y-1">
          {!collapsed && (
            <p className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider px-3 mb-2">
              Principal
            </p>
          )}
          {mainMenuItems.map(item => (
            <NavItem key={item.href} item={item} />
          ))}
        </div>

        {/* Security Module - Only for admins */}
        {isAdmin && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="text-xs font-semibold text-sidebar-muted uppercase tracking-wider px-3 mb-2 flex items-center gap-2">
                <Shield className="h-3.5 w-3.5" />
                Seguridad
              </p>
            )}
            {collapsed && (
              <div className="flex justify-center py-2">
                <Shield className="h-4 w-4 text-sidebar-muted" />
              </div>
            )}
            {securityMenuItems.map(item => (
              <NavItem key={item.href} item={item} />
            ))}
          </div>
        )}
      </nav>

      {/* Theme Toggle */}
      <div className="p-3 border-t border-sidebar-border">
        {collapsed ? (
          <Tooltip delayDuration={0}>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="w-full h-10 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
              >
                {resolvedTheme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {resolvedTheme === "dark" ? "Modo Claro" : "Modo Oscuro"}
            </TooltipContent>
          </Tooltip>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleTheme}
            className="w-full justify-start gap-3 text-sidebar-muted hover:text-sidebar-foreground hover:bg-sidebar-accent"
          >
            {resolvedTheme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
            <span>{resolvedTheme === "dark" ? "Modo Claro" : "Modo Oscuro"}</span>
          </Button>
        )}
      </div>
    </aside>
  );
}

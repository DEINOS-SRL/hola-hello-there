import React from 'react';
import { Search, ChevronDown, LogOut, User, Settings, Moon, Sun, MessageSquarePlus, Star, Menu } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/components/ThemeProvider';
import { useSidebarContext } from '@/contexts/SidebarContext';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useNavigate } from 'react-router-dom';
import { NotificationsDropdown } from './NotificationsDropdown';
import { FeedbackModal } from '@/components/modals/FeedbackModal';
import { useFeedbacks } from '@/modules/security/hooks/useFeedbacks';

function ThemeToggleIcon() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
          >
            {isDark ? (
              <Sun className="h-5 w-5 text-muted-foreground" />
            ) : (
              <Moon className="h-5 w-5 text-muted-foreground" />
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isDark ? 'Modo claro' : 'Modo oscuro'}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function AppHeader() {
  const { user, empresa, logout } = useAuth();
  const navigate = useNavigate();
  const [feedbackOpen, setFeedbackOpen] = React.useState(false);
  const { feedbacks } = useFeedbacks();
  const { isMobile, toggleSidebar } = useSidebarContext();
  
  const destacadosCount = feedbacks.filter(f => f.destacado && f.estado === 'pendiente').length;

  const initials = user 
    ? `${user.nombre.charAt(0)}${user.apellido.charAt(0)}`.toUpperCase()
    : 'U';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="h-[56px] md:h-[60px] border-b border-border bg-card flex items-center justify-between px-3 md:px-6 sticky top-0 z-30">
      <div className="flex items-center gap-2 md:gap-4 flex-1">
        {/* Botón hamburguesa para mobile */}
        {isMobile && (
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="shrink-0"
          >
            <Menu className="h-5 w-5" />
          </Button>
        )}
        
        {/* Barra de búsqueda - oculta en mobile muy pequeño */}
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none z-10" />
          <Input
            type="search"
            placeholder="Buscar..."
            className="pl-10 md:pl-10 bg-muted/50 border-0 focus-visible:ring-1"
          />
        </div>
        
        {/* Icono de búsqueda para mobile */}
        <Button variant="ghost" size="icon" className="sm:hidden">
          <Search className="h-5 w-5 text-muted-foreground" />
        </Button>
      </div>

      <div className="flex items-center gap-1 md:gap-3">
        {/* Indicador de feedbacks destacados pendientes con pulso */}
        {destacadosCount > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative animate-pulse-glow"
                  onClick={() => navigate('/configuracion/administracion/feedbacks?filter=destacados')}
                >
                  <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-destructive-foreground text-[10px] font-medium flex items-center justify-center">
                    {destacadosCount > 9 ? '9+' : destacadosCount}
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{destacadosCount} feedback{destacadosCount > 1 ? 's' : ''} destacado{destacadosCount > 1 ? 's' : ''} pendiente{destacadosCount > 1 ? 's' : ''}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
        
        <NotificationsDropdown />

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setFeedbackOpen(true)}
              >
                <MessageSquarePlus className="h-5 w-5 text-muted-foreground" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>Enviar feedback</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <ThemeToggleIcon />
        
        <FeedbackModal open={feedbackOpen} onOpenChange={setFeedbackOpen} />

        <div className="h-6 w-px bg-border" />

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="gap-2 px-2">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm font-medium">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium leading-none">
                  {user?.nombre} {user?.apellido}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {empresa?.nombre}
                </p>
              </div>
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate('/perfil')}>
              <User className="mr-2 h-4 w-4" />
              Mi Perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/configuracion')}>
              <Settings className="mr-2 h-4 w-4" />
              Configuración
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
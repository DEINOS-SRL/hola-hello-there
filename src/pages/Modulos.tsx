import { useState } from 'react';
import { 
  Shield, 
  BarChart3, 
  FileText, 
  Calendar, 
  MessageSquare,
  LayoutGrid,
  List,
  Lock,
  ArrowRight,
  AppWindow,
  ClipboardList,
  Loader2,
  Star
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ViewMode } from '@/types/auth';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { segClient } from '@/modules/security/services/segClient';
import { useFavoritos } from '@/modules/security/hooks/useFavoritos';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

// Mapeo de nombres de iconos a componentes
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Shield,
  BarChart3,
  FileText,
  Calendar,
  MessageSquare,
  AppWindow,
  ClipboardList,
};

interface ModuleData {
  id: string;
  nombre: string;
  descripcion: string | null;
  activa: boolean | null;
  icono: string | null;
  ruta: string | null;
  hasAccess: boolean;
  modulo_id?: string; // ID del módulo en seg.modulos para favoritos
}

export default function Modulos() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const navigate = useNavigate();
  const { toggleFavorito, isFavorito, isAdding, isRemoving } = useFavoritos();

  // Fetch aplicaciones from database
  const { data: aplicaciones, isLoading: isLoadingApps } = useQuery({
    queryKey: ['aplicaciones-modulos'],
    queryFn: async () => {
      const { data, error } = await segClient
        .from('aplicaciones')
        .select('*')
        .order('nombre');
      
      if (error) throw error;
      return data;
    }
  });

  // Fetch modulos from database (para favoritos)
  const { data: modulos, isLoading: isLoadingModulos } = useQuery({
    queryKey: ['modulos-para-favoritos'],
    queryFn: async () => {
      const { data, error } = await segClient
        .from('modulos')
        .select('id, nombre, ruta, icono, descripcion, activo')
        .eq('activo', true)
        .order('nombre');
      
      if (error) throw error;
      return data;
    }
  });

  const isLoading = isLoadingApps || isLoadingModulos;

  // Transform data for display - usar modulos en lugar de aplicaciones
  const modules: ModuleData[] = (modulos ?? []).map(mod => ({
    id: mod.id,
    nombre: mod.nombre,
    descripcion: mod.descripcion,
    activa: mod.activo,
    icono: mod.icono ?? 'AppWindow',
    ruta: mod.ruta ?? null,
    hasAccess: mod.activo === true && mod.ruta !== null,
    modulo_id: mod.id,
  }));

  const accessibleModules = modules.filter(m => m.hasAccess);
  const otherModules = modules.filter(m => !m.hasAccess);

  const handleModuleClick = (module: ModuleData) => {
    if (module.hasAccess && module.activa && module.ruta) {
      navigate(module.ruta);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Módulos</h1>
          <p className="text-muted-foreground mt-1">
            Accede a los módulos disponibles según tus permisos
          </p>
        </div>
        
        {/* View Toggle */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
          <Button
            variant={viewMode === 'cards' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('cards')}
            className="gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            <span className="hidden sm:inline">Tarjetas</span>
          </Button>
          <Button
            variant={viewMode === 'list' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="gap-2"
          >
            <List className="h-4 w-4" />
            <span className="hidden sm:inline">Lista</span>
          </Button>
        </div>
      </div>

      {/* Accessible Modules */}
      {accessibleModules.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-success" />
            Módulos con acceso
          </h2>
          
          {viewMode === 'cards' ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {accessibleModules.map((module) => (
                <ModuleCard 
                  key={module.id} 
                  module={module} 
                  onClick={() => handleModuleClick(module)}
                  isFavorite={module.modulo_id ? isFavorito(module.modulo_id) : false}
                  onToggleFavorite={() => module.modulo_id && toggleFavorito(module.modulo_id)}
                  isTogglingFavorite={isAdding || isRemoving}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {accessibleModules.map((module) => (
                <ModuleListItem 
                  key={module.id} 
                  module={module}
                  onClick={() => handleModuleClick(module)}
                  isFavorite={module.modulo_id ? isFavorito(module.modulo_id) : false}
                  onToggleFavorite={() => module.modulo_id && toggleFavorito(module.modulo_id)}
                  isTogglingFavorite={isAdding || isRemoving}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Other Modules */}
      {otherModules.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-muted-foreground">
            <Lock className="h-4 w-4" />
            Otros módulos
          </h2>
          
          {viewMode === 'cards' ? (
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
              {otherModules.map((module) => (
                <ModuleCard 
                  key={module.id} 
                  module={module} 
                  disabled
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {otherModules.map((module) => (
                <ModuleListItem 
                  key={module.id} 
                  module={module}
                  disabled
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function ModuleCard({ 
  module, 
  disabled,
  onClick,
  isFavorite,
  onToggleFavorite,
  isTogglingFavorite
}: { 
  module: ModuleData; 
  disabled?: boolean;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isTogglingFavorite?: boolean;
}) {
  const Icon = iconMap[module.icono ?? 'AppWindow'] ?? AppWindow;
  
  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };
  
  return (
    <Card 
      className={cn(
        "transition-all cursor-pointer group",
        disabled 
          ? "opacity-50 cursor-not-allowed" 
          : "hover:shadow-lg hover:border-primary"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className={cn(
            "h-12 w-12 rounded-lg flex items-center justify-center",
            disabled ? "bg-muted" : "bg-primary/10"
          )}>
            <Icon className={cn(
              "h-6 w-6",
              disabled ? "text-muted-foreground" : "text-primary"
            )} />
          </div>
          <div className="flex items-center gap-2">
            {!disabled && onToggleFavorite && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={handleFavoriteClick}
                    disabled={isTogglingFavorite}
                  >
                    <Star className={cn(
                      "h-4 w-4 transition-colors",
                      isFavorite 
                        ? "fill-yellow-400 text-yellow-400" 
                        : "text-muted-foreground hover:text-yellow-400"
                    )} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                </TooltipContent>
              </Tooltip>
            )}
            {!module.activa && (
              <Badge variant="secondary">Próximamente</Badge>
            )}
            {module.activa && !module.hasAccess && (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Sin acceso
              </Badge>
            )}
          </div>
        </div>
        <CardTitle className="text-lg mt-3">{module.nombre}</CardTitle>
        <CardDescription>{module.descripcion}</CardDescription>
      </CardHeader>
      {!disabled && (
        <CardContent className="pt-0">
          <Button variant="ghost" className="w-full justify-between group-hover:text-primary">
            Acceder
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

function ModuleListItem({ 
  module, 
  disabled,
  onClick,
  isFavorite,
  onToggleFavorite,
  isTogglingFavorite
}: { 
  module: ModuleData; 
  disabled?: boolean;
  onClick?: () => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  isTogglingFavorite?: boolean;
}) {
  const Icon = iconMap[module.icono ?? 'AppWindow'] ?? AppWindow;

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleFavorite?.();
  };
  
  return (
    <div 
      className={cn(
        "flex items-center gap-4 p-4 rounded-lg border border-border transition-all",
        disabled 
          ? "opacity-50 cursor-not-allowed bg-muted/30" 
          : "hover:shadow-md hover:border-primary cursor-pointer group"
      )}
      onClick={disabled ? undefined : onClick}
    >
      <div className={cn(
        "h-10 w-10 rounded-lg flex items-center justify-center shrink-0",
        disabled ? "bg-muted" : "bg-primary/10"
      )}>
        <Icon className={cn(
          "h-5 w-5",
          disabled ? "text-muted-foreground" : "text-primary"
        )} />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium">{module.nombre}</h3>
        <p className="text-sm text-muted-foreground truncate">{module.descripcion}</p>
      </div>

      <div className="flex items-center gap-2">
        {!disabled && onToggleFavorite && (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={handleFavoriteClick}
                disabled={isTogglingFavorite}
              >
                <Star className={cn(
                  "h-4 w-4 transition-colors",
                  isFavorite 
                    ? "fill-yellow-400 text-yellow-400" 
                    : "text-muted-foreground hover:text-yellow-400"
                )} />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {isFavorite ? 'Quitar de favoritos' : 'Agregar a favoritos'}
            </TooltipContent>
          </Tooltip>
        )}
        {!module.activa && (
          <Badge variant="secondary">Próximamente</Badge>
        )}
        {module.activa && !module.hasAccess && (
          <Badge variant="outline" className="gap-1">
            <Lock className="h-3 w-3" />
            Sin acceso
          </Badge>
        )}
        {!disabled && (
          <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-transform group-hover:translate-x-1" />
        )}
      </div>
    </div>
  );
}

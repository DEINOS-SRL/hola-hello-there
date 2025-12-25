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
  ArrowRight
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useNavigate } from 'react-router-dom';
import { ViewMode, Aplicacion } from '@/types/auth';
import { cn } from '@/lib/utils';

// Mock modules data
const modules: (Aplicacion & { icon: typeof Shield; hasAccess: boolean })[] = [
  {
    id: '1',
    nombre: 'Seguridad',
    descripcion: 'Gestión de usuarios, roles, permisos y empresas',
    activa: true,
    icono: 'Shield',
    ruta: '/seguridad/usuarios',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    icon: Shield,
    hasAccess: true,
  },
  {
    id: '2',
    nombre: 'Reportes',
    descripcion: 'Generación y visualización de reportes empresariales',
    activa: true,
    icono: 'BarChart3',
    ruta: '/reportes',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    icon: BarChart3,
    hasAccess: false,
  },
  {
    id: '3',
    nombre: 'Documentos',
    descripcion: 'Gestión documental y archivos corporativos',
    activa: true,
    icono: 'FileText',
    ruta: '/documentos',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    icon: FileText,
    hasAccess: false,
  },
  {
    id: '4',
    nombre: 'Calendario',
    descripcion: 'Programación de eventos y recordatorios',
    activa: false,
    icono: 'Calendar',
    ruta: '/calendario',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    icon: Calendar,
    hasAccess: false,
  },
  {
    id: '5',
    nombre: 'Mensajería',
    descripcion: 'Sistema de comunicación interna',
    activa: false,
    icono: 'MessageSquare',
    ruta: '/mensajeria',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    icon: MessageSquare,
    hasAccess: false,
  },
];

export default function Modulos() {
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const navigate = useNavigate();

  const accessibleModules = modules.filter(m => m.hasAccess && m.activa);
  const otherModules = modules.filter(m => !m.hasAccess || !m.activa);

  const handleModuleClick = (module: typeof modules[0]) => {
    if (module.hasAccess && module.activa && module.ruta) {
      navigate(module.ruta);
    }
  };

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
              />
            ))}
          </div>
        )}
      </div>

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
  onClick 
}: { 
  module: typeof modules[0]; 
  disabled?: boolean;
  onClick?: () => void;
}) {
  const Icon = module.icon;
  
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
  onClick 
}: { 
  module: typeof modules[0]; 
  disabled?: boolean;
  onClick?: () => void;
}) {
  const Icon = module.icon;
  
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

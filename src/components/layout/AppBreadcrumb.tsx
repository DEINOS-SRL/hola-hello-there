import { useLocation, Link } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Mapa de rutas a nombres legibles
const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  modulos: 'Módulos',
  perfil: 'Perfil',
  // Configuración
  configuracion: 'Configuración',
  empresa: 'Empresa',
  notificaciones: 'Notificaciones',
  preferencias: 'Preferencias',
  administracion: 'Administración',
  // Seguridad
  seguridad: 'Seguridad',
  usuarios: 'Usuarios',
  empresas: 'Empresas',
  roles: 'Roles',
  aplicaciones: 'Aplicaciones',
  // Módulos
  empleados: 'Empleados',
  equipos: 'Equipos',
  listado: 'Listado',
  mantenimientos: 'Mantenimientos',
  partes: 'Partes',
  operacion: 'Operación',
  movimientos: 'Movimientos',
  'partes-equipos': 'Partes de Equipos',
  habilitaciones: 'Habilitaciones',
  certificaciones: 'Certificaciones',
  vencimientos: 'Vencimientos',
  rrhh: 'RRHH',
  asistencia: 'Asistencia',
  horarios: 'Horarios',
  comercial: 'Comercial',
  presupuestos: 'Presupuestos',
  seguimientos: 'Seguimientos',
  conocimiento: 'Conocimiento',
  sgi: 'SGI',
};

export function AppBreadcrumb() {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  // No mostrar breadcrumb en dashboard (es la home)
  if (pathnames.length === 0 || (pathnames.length === 1 && pathnames[0] === 'dashboard')) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/dashboard" className="flex items-center gap-1 hover:text-primary transition-colors">
              <Home className="h-4 w-4" />
              <span>Inicio</span>
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>

        {pathnames.map((segment, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;
          const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

          return (
            <div key={routeTo} className="flex items-center">
              <BreadcrumbSeparator>
                <ChevronRight className="h-4 w-4" />
              </BreadcrumbSeparator>
              <BreadcrumbItem>
                {isLast ? (
                  <BreadcrumbPage className="font-medium">{label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={routeTo} className="hover:text-primary transition-colors">
                      {label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

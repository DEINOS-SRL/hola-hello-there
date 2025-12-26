import { Link } from 'react-router-dom';
import { Users, Building2, Shield, LayoutGrid, Settings, UserCog, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const adminModules = [
  {
    title: 'Empresas',
    description: 'Administra las empresas registradas en la plataforma',
    icon: Building2,
    href: '/configuracion/administracion/empresas',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    title: 'Usuarios',
    description: 'Gestiona los usuarios del sistema, sus datos y estados',
    icon: Users,
    href: '/configuracion/administracion/usuarios',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Roles',
    description: 'Define y configura los roles de acceso al sistema',
    icon: Shield,
    href: '/configuracion/administracion/roles',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
  {
    title: 'Módulos',
    description: 'Gestiona los módulos y aplicaciones disponibles',
    icon: LayoutGrid,
    href: '/configuracion/administracion/modulos',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
  {
    title: 'Feedbacks',
    description: 'Revisa sugerencias, reportes y consultas de usuarios',
    icon: MessageSquare,
    href: '/configuracion/administracion/feedbacks',
    color: 'text-pink-500',
    bgColor: 'bg-pink-500/10',
  },
];

export default function SeguridadIndex() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <UserCog className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Administración</h1>
          <p className="text-muted-foreground">
            Gestión de usuarios, empresas, roles y permisos del sistema
          </p>
        </div>
      </div>

      {/* Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {adminModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} to={module.href}>
              <Card className="h-full hover:shadow-lg hover:border-primary/50 transition-all group cursor-pointer">
                <CardHeader className="pb-3">
                  <div className={`p-2.5 rounded-lg w-fit ${module.bgColor}`}>
                    <Icon className={`h-5 w-5 ${module.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {module.title}
                  </CardTitle>
                  <CardDescription className="mt-1.5 text-sm">
                    {module.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Info Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base">Configuración del Sistema</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Desde este módulo puedes gestionar todos los aspectos administrativos de la plataforma.
            Asegúrate de configurar correctamente los roles y permisos para mantener la 
            integridad de los datos y el acceso controlado a las funcionalidades.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

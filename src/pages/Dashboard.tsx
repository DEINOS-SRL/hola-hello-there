import { Users, Building2, Shield, AppWindow, TrendingUp, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

const stats = [
  { name: 'Usuarios Activos', value: '24', icon: Users, change: '+12%', color: 'text-primary' },
  { name: 'Empresas', value: '3', icon: Building2, change: '+2', color: 'text-success' },
  { name: 'Roles Configurados', value: '8', icon: Shield, change: '0', color: 'text-muted-foreground' },
  { name: 'Módulos Activos', value: '5', icon: AppWindow, change: '+1', color: 'text-primary' },
];

const recentActivity = [
  { id: 1, action: 'Usuario creado', description: 'Juan Pérez se registró en el sistema', time: 'Hace 2 horas' },
  { id: 2, action: 'Rol asignado', description: 'María García ahora es Administradora', time: 'Hace 5 horas' },
  { id: 3, action: 'Empresa actualizada', description: 'DNSCloud Corp actualizó sus datos', time: 'Hace 1 día' },
  { id: 4, action: 'Módulo activado', description: 'Módulo de Reportes fue habilitado', time: 'Hace 2 días' },
];

export default function Dashboard() {
  const { user, empresa } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Welcome Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            ¡Bienvenido, {user?.nombre}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Panel de control de {empresa?.nombre}
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Clock className="h-4 w-4" />
          <span>Última conexión: Hoy a las 10:30 AM</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.name} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.name}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <TrendingUp className="h-3 w-3 text-success" />
                  <span className="text-success">{stat.change}</span> desde el último mes
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Actividad Reciente</CardTitle>
            <CardDescription>Últimas acciones en el sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-4 pb-4 border-b last:border-0 last:pb-0">
                  <div className="h-2 w-2 mt-2 rounded-full bg-primary" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{activity.action}</p>
                    <p className="text-sm text-muted-foreground truncate">{activity.description}</p>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap">{activity.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Acciones Rápidas</CardTitle>
            <CardDescription>Accesos directos a funciones comunes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <QuickActionCard
                icon={Users}
                title="Nuevo Usuario"
                description="Agregar usuario al sistema"
                href="/seguridad/usuarios"
              />
              <QuickActionCard
                icon={Building2}
                title="Nueva Empresa"
                description="Registrar nueva empresa"
                href="/seguridad/empresas"
              />
              <QuickActionCard
                icon={Shield}
                title="Gestionar Roles"
                description="Configurar permisos"
                href="/seguridad/roles"
              />
              <QuickActionCard
                icon={AppWindow}
                title="Ver Módulos"
                description="Explorar aplicaciones"
                href="/modulos"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function QuickActionCard({ 
  icon: Icon, 
  title, 
  description, 
  href 
}: { 
  icon: typeof Users; 
  title: string; 
  description: string;
  href: string;
}) {
  return (
    <Link
      to={href}
      className="p-4 rounded-lg border border-border hover:border-primary hover:bg-secondary/50 transition-all group"
    >
      <Icon className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
      <h3 className="font-medium mt-2 text-sm group-hover:text-primary transition-colors">{title}</h3>
      <p className="text-xs text-muted-foreground mt-0.5">{description}</p>
    </Link>
  );
}

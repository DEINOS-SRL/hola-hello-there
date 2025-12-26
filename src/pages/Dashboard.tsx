import { Users, Building2, Shield, AppWindow, TrendingUp, Clock, MessageSquare, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { useFeedbacks } from '@/modules/security/hooks/useFeedbacks';
import { moduleRegistry } from '@/app/moduleRegistry';
import { supabase } from '@/integrations/supabase/client';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

// Helper para obtener nombre de módulo
const getModuloLabel = (moduloId: string): string => {
  if (moduloId === 'general') return 'General';
  if (moduloId === 'dashboard') return 'Dashboard';
  if (moduloId === 'otro') return 'Otro';
  if (moduloId === 'sin-modulo') return 'Sin asignar';
  const modulo = moduleRegistry.find(m => m.moduleId === moduloId);
  return modulo?.name || moduloId;
};

export default function Dashboard() {
  const { user, empresa } = useAuth();
  const { feedbacks } = useFeedbacks();
  const [lastConnection, setLastConnection] = useState<string | null>(null);

  // Obtener última conexión de la sesión de Supabase
  useEffect(() => {
    const getLastConnection = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.last_sign_in_at) {
          const lastSignIn = new Date(session.user.last_sign_in_at);
          const now = new Date();
          const diffInHours = (now.getTime() - lastSignIn.getTime()) / (1000 * 60 * 60);
          
          if (diffInHours < 24) {
            // Si fue hoy, mostrar hora
            const isToday = lastSignIn.toDateString() === now.toDateString();
            if (isToday) {
              setLastConnection(`Hoy a las ${lastSignIn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
            } else {
              setLastConnection(`Ayer a las ${lastSignIn.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`);
            }
          } else {
            // Si fue hace más de 24 horas, mostrar fecha relativa
            setLastConnection(formatDistanceToNow(lastSignIn, { addSuffix: true, locale: es }));
          }
        } else {
          setLastConnection('No disponible');
        }
      } catch (error) {
        console.error('Error obteniendo última conexión:', error);
        setLastConnection('No disponible');
      }
    };

    getLastConnection();
  }, []);

  // Calcular estadísticas de feedbacks
  const feedbackStats = {
    total: feedbacks.length,
    pendientes: feedbacks.filter(f => f.estado === 'pendiente').length,
    resueltos: feedbacks.filter(f => f.estado === 'resuelto').length,
  };

  // Agrupar feedbacks por módulo
  const feedbacksPorModulo = feedbacks.reduce((acc, fb) => {
    const modulo = fb.modulo_referencia || 'sin-modulo';
    acc[modulo] = (acc[modulo] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Ordenar por cantidad y tomar top 5
  const topModulos = Object.entries(feedbacksPorModulo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

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
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>Última conexión: {lastConnection || 'Cargando...'}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground/70 border-l border-border pl-3">
            <span className="font-medium">v{typeof __APP_VERSION__ !== 'undefined' ? __APP_VERSION__ : '0.0.0'}</span>
            <span>•</span>
            <span>
              {typeof __BUILD_TIME__ !== 'undefined' 
                ? new Date(__BUILD_TIME__).toLocaleString('es-ES', { 
                    year: 'numeric', 
                    month: 'short', 
                    day: 'numeric', 
                    hour: '2-digit', 
                    minute: '2-digit',
                    timeZoneName: 'short'
                  })
                : 'Fecha no disponible'}
            </span>
          </div>
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

      {/* Feedbacks Stats Section */}
      {feedbacks.length > 0 && (
        <div className="grid gap-4 grid-cols-1 lg:grid-cols-3">
          {/* Resumen de feedbacks */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-primary" />
                Feedbacks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{feedbackStats.total}</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1 text-xs">
                  <AlertCircle className="h-3 w-3 text-amber-500" />
                  <span className="text-muted-foreground">{feedbackStats.pendientes} pendientes</span>
                </div>
                <div className="flex items-center gap-1 text-xs">
                  <CheckCircle2 className="h-3 w-3 text-green-500" />
                  <span className="text-muted-foreground">{feedbackStats.resueltos} resueltos</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Feedbacks por módulo */}
          <Card className="lg:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Feedbacks por Módulo</CardTitle>
              <CardDescription className="text-xs">Top 5 módulos con más feedbacks</CardDescription>
            </CardHeader>
            <CardContent>
              {topModulos.length === 0 ? (
                <p className="text-sm text-muted-foreground">No hay feedbacks aún</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {topModulos.map(([modulo, count]) => (
                    <Badge key={modulo} variant="secondary" className="gap-1">
                      {getModuloLabel(modulo)}
                      <span className="bg-primary/20 text-primary px-1.5 py-0.5 rounded text-xs font-bold">
                        {count}
                      </span>
                    </Badge>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

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
                href="/configuracion/administracion/usuarios"
              />
              <QuickActionCard
                icon={Building2}
                title="Nueva Empresa"
                description="Registrar nueva empresa"
                href="/configuracion/administracion/empresas"
              />
              <QuickActionCard
                icon={Shield}
                title="Gestionar Roles"
                description="Configurar permisos"
                href="/configuracion/administracion/roles"
              />
              <QuickActionCard
                icon={MessageSquare}
                title="Ver Feedbacks"
                description="Revisar sugerencias"
                href="/configuracion/administracion/feedbacks"
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
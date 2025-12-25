import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeftRight, Truck, Package, Clock, TrendingUp, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Movimientos Hoy', value: '24', icon: ArrowLeftRight, color: 'text-blue-500', trend: '+12%' },
  { label: 'Equipos en Tránsito', value: '8', icon: Truck, color: 'text-amber-500' },
  { label: 'Pendientes', value: '5', icon: Clock, color: 'text-orange-500' },
  { label: 'Completados (Mes)', value: '342', icon: Package, color: 'text-emerald-500', trend: '+8%' },
];

const recentMovements = [
  { id: 1, equipo: 'Camión Volvo FH16', origen: 'Base Central', destino: 'Obra Norte', estado: 'En tránsito', hora: '08:30' },
  { id: 2, equipo: 'Retroexcavadora CAT 420F', origen: 'Obra Sur', destino: 'Taller', estado: 'Completado', hora: '07:45' },
  { id: 3, equipo: 'Grúa Liebherr LTM', origen: 'Puerto', destino: 'Obra Centro', estado: 'Pendiente', hora: '09:00' },
  { id: 4, equipo: 'Mixer Hormigonera', origen: 'Planta', destino: 'Obra Norte', estado: 'En tránsito', hora: '08:15' },
];

const getEstadoBadge = (estado: string) => {
  const styles: Record<string, string> = {
    'Completado': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    'En tránsito': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    'Pendiente': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  };
  return styles[estado] || 'bg-muted text-muted-foreground';
};

export default function OperacionIndex() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Operación</h1>
          <p className="text-muted-foreground">Control y gestión de operaciones diarias</p>
        </div>
        <Button onClick={() => navigate('/operacion/movimientos')}>
          <ArrowLeftRight className="h-4 w-4 mr-2" />
          Gestionar Movimientos
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-3xl font-bold">{stat.value}</p>
                    {stat.trend && (
                      <span className="text-xs text-emerald-600 flex items-center">
                        <TrendingUp className="h-3 w-3 mr-0.5" />
                        {stat.trend}
                      </span>
                    )}
                  </div>
                </div>
                <stat.icon className={`h-10 w-10 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Movimientos Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 group"
          onClick={() => navigate('/operacion/movimientos')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30 group-hover:bg-blue-200 dark:group-hover:bg-blue-900/50 transition-colors">
                <ArrowLeftRight className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Movimientos</CardTitle>
                <CardDescription>Traslados de equipos y recursos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Gestiona los movimientos de equipos entre obras, bases y talleres. 
              Registra traslados, asigna responsables y realiza seguimiento en tiempo real.
            </p>
            <Button variant="link" className="px-0 mt-2">
              Ir a Movimientos →
            </Button>
          </CardContent>
        </Card>

        {/* Alertas Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <AlertTriangle className="h-6 w-6 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Alertas Operativas</CardTitle>
                <CardDescription>Notificaciones pendientes</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-amber-500" />
                <span>3 movimientos pendientes de aprobación</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-red-500" />
                <span>1 equipo con retraso en llegada</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <span className="h-2 w-2 rounded-full bg-blue-500" />
                <span>2 traslados programados para hoy</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Movements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg">Movimientos Recientes</CardTitle>
            <CardDescription>Últimos movimientos registrados</CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={() => navigate('/operacion/movimientos')}>
            Ver todos
          </Button>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentMovements.map((mov) => (
              <div 
                key={mov.id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <Truck className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{mov.equipo}</p>
                    <p className="text-xs text-muted-foreground">
                      {mov.origen} → {mov.destino}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full ${getEstadoBadge(mov.estado)}`}>
                    {mov.estado}
                  </span>
                  <span className="text-xs text-muted-foreground">{mov.hora}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

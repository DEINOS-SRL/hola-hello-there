import { Link } from 'react-router-dom';
import { BadgeCheck, Award, CalendarClock, AlertTriangle, CheckCircle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const habilitacionesModules = [
  {
    title: 'Certificaciones',
    description: 'Gestionar certificaciones de empleados y equipos',
    icon: Award,
    href: '/habilitaciones/certificaciones',
    color: 'text-emerald-500',
    bgColor: 'bg-emerald-500/10',
  },
  {
    title: 'Vencimientos',
    description: 'Control y alertas de vencimientos próximos',
    icon: CalendarClock,
    href: '/habilitaciones/vencimientos',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
];

const resumen = {
  vigentes: 45,
  porVencer: 8,
  vencidas: 3,
  total: 56,
};

export default function HabilitacionesIndex() {
  const porcentajeVigentes = (resumen.vigentes / resumen.total) * 100;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <BadgeCheck className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Habilitaciones</h1>
          <p className="text-muted-foreground">
            Gestión de habilitaciones, certificaciones y vencimientos
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Vigentes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-600">{resumen.vigentes}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CalendarClock className="h-4 w-4 text-amber-500" />
              Por Vencer
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-amber-600">{resumen.porVencer}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              Vencidas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-red-600">{resumen.vencidas}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Cobertura General</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <span className="text-2xl font-bold">{porcentajeVigentes.toFixed(0)}%</span>
            <Progress value={porcentajeVigentes} className="h-2" />
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {habilitacionesModules.map((module) => {
          const Icon = module.icon;
          return (
            <Link key={module.href} to={module.href}>
              <Card className="hover:shadow-md transition-all hover:border-primary/50 h-full">
                <CardHeader>
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${module.bgColor}`}>
                      <Icon className={`h-5 w-5 ${module.color}`} />
                    </div>
                    <CardTitle className="text-lg">{module.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription>{module.description}</CardDescription>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Alertas */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="h-5 w-5" />
            Alertas de Vencimiento
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-amber-700 dark:text-amber-400">
          <p>
            Hay <strong>{resumen.porVencer} habilitaciones</strong> próximas a vencer en los próximos 30 días.
            Revisa la sección de vencimientos para más detalles.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

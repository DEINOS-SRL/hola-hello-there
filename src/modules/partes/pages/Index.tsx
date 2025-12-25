import { Link } from 'react-router-dom';
import { ClipboardList, FileEdit, History, Calendar, CheckCircle2, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const partesModules = [
  {
    title: 'Registro de Partes',
    description: 'Crear y editar partes diarios de operación',
    icon: FileEdit,
    href: '/partes-diarios/registro',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Historial',
    description: 'Ver historial completo de partes diarios',
    icon: History,
    href: '/partes-diarios/historial',
    color: 'text-purple-500',
    bgColor: 'bg-purple-500/10',
  },
];

const resumenHoy = {
  completados: 12,
  pendientes: 3,
  equiposActivos: 18,
};

export default function PartesIndex() {
  const today = new Date().toLocaleDateString('es-AR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <ClipboardList className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Partes Diarios</h1>
            <p className="text-muted-foreground capitalize">{today}</p>
          </div>
        </div>
        <Button asChild>
          <Link to="/partes-diarios/registro">
            <FileEdit className="h-4 w-4 mr-2" />
            Nuevo Parte
          </Link>
        </Button>
      </div>

      {/* Stats del día */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-green-500" />
              Partes Completados Hoy
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-600">{resumenHoy.completados}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-amber-500" />
              Pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-amber-600">{resumenHoy.pendientes}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              Equipos Activos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold">{resumenHoy.equiposActivos}</span>
          </CardContent>
        </Card>
      </div>

      {/* Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {partesModules.map((module) => {
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
    </div>
  );
}

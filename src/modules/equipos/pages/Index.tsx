import { Link } from 'react-router-dom';
import { Truck, List, Wrench, Plus, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const equiposModules = [
  {
    title: 'Maestro de Equipos',
    description: 'Ver y gestionar todos los equipos registrados',
    icon: List,
    href: '/equipos/listado',
    color: 'text-blue-500',
    bgColor: 'bg-blue-500/10',
  },
  {
    title: 'Mantenimientos',
    description: 'Historial y programación de mantenimientos',
    icon: Wrench,
    href: '/equipos/mantenimientos',
    color: 'text-amber-500',
    bgColor: 'bg-amber-500/10',
  },
];

const stats = [
  { label: 'Equipos activos', value: '24', change: '+2' },
  { label: 'En mantenimiento', value: '3', change: '0' },
  { label: 'Próximos services', value: '5', change: '+1' },
];

export default function EquiposIndex() {
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Truck className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Equipos</h1>
            <p className="text-muted-foreground">
              Gestión de equipos, maquinaria y mantenimientos
            </p>
          </div>
        </div>
        <Button asChild>
          <Link to="/equipos/listado">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Equipo
          </Link>
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="pb-2">
              <CardDescription>{stat.label}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-bold">{stat.value}</span>
                <span className="text-sm text-muted-foreground">{stat.change} este mes</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Modules Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        {equiposModules.map((module) => {
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

import { useState } from 'react';
import { Wrench, Plus, Search, Calendar, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Datos de ejemplo
const mantenimientosDemo = [
  { id: '1', equipo: 'Camión Volvo FH16', tipo: 'Preventivo', descripcion: 'Cambio de aceite y filtros', fecha: '2024-12-20', estado: 'programado' },
  { id: '2', equipo: 'Excavadora CAT 320', tipo: 'Correctivo', descripcion: 'Reparación sistema hidráulico', fecha: '2024-12-18', estado: 'en_progreso' },
  { id: '3', equipo: 'Grúa Liebherr LTM', tipo: 'Preventivo', descripcion: 'Inspección de cables', fecha: '2024-12-15', estado: 'completado' },
  { id: '4', equipo: 'Retroexcavadora JCB', tipo: 'Correctivo', descripcion: 'Cambio de neumáticos', fecha: '2024-12-10', estado: 'completado' },
];

const estadoConfig: Record<string, { color: string; icon: typeof Clock; label: string }> = {
  programado: { color: 'bg-blue-500/10 text-blue-600', icon: Calendar, label: 'Programado' },
  en_progreso: { color: 'bg-amber-500/10 text-amber-600', icon: Clock, label: 'En Progreso' },
  completado: { color: 'bg-green-500/10 text-green-600', icon: CheckCircle, label: 'Completado' },
};

export default function Mantenimientos() {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Wrench className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mantenimientos</h1>
            <p className="text-muted-foreground text-sm">
              Gestión de mantenimientos preventivos y correctivos
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Programar Mantenimiento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Programados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-blue-600">5</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En Progreso
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-amber-600">2</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Vencidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-red-600">1</span>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar mantenimiento..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="todos">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="programados">Programados</TabsTrigger>
          <TabsTrigger value="en_progreso">En Progreso</TabsTrigger>
          <TabsTrigger value="completados">Completados</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4">
          <div className="grid gap-4">
            {mantenimientosDemo.map((m) => {
              const config = estadoConfig[m.estado];
              const Icon = config.icon;
              return (
                <Card key={m.id} className="hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{m.equipo}</CardTitle>
                        <CardDescription>{m.descripcion}</CardDescription>
                      </div>
                      <Badge className={config.color}>
                        <Icon className="h-3 w-3 mr-1" />
                        {config.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        {new Date(m.fecha).toLocaleDateString('es-AR')}
                      </span>
                      <Badge variant="outline">{m.tipo}</Badge>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

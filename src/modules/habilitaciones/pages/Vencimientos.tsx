import { CalendarClock, AlertTriangle, CheckCircle, Clock, User, FileText } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Datos de ejemplo
const vencimientosDemo = [
  { id: '1', empleado: 'Carlos López', habilitacion: 'Operador de Grúa', diasRestantes: 15, fechaVencimiento: '2025-01-10' },
  { id: '2', empleado: 'Roberto Sánchez', habilitacion: 'Licencia de Conducir D', diasRestantes: 22, fechaVencimiento: '2025-01-17' },
  { id: '3', empleado: 'Laura Torres', habilitacion: 'Curso de Izaje', diasRestantes: 28, fechaVencimiento: '2025-01-23' },
  { id: '4', empleado: 'Ana Martínez', habilitacion: 'Primeros Auxilios', diasRestantes: -24, fechaVencimiento: '2024-12-01' },
  { id: '5', empleado: 'Pedro Gómez', habilitacion: 'Trabajo en Altura', diasRestantes: -10, fechaVencimiento: '2024-12-15' },
];

export default function Vencimientos() {
  const porVencer = vencimientosDemo.filter((v) => v.diasRestantes > 0 && v.diasRestantes <= 30);
  const vencidos = vencimientosDemo.filter((v) => v.diasRestantes <= 0);

  const getUrgencyColor = (dias: number) => {
    if (dias <= 0) return 'bg-red-500/10 text-red-600 border-red-200';
    if (dias <= 7) return 'bg-red-500/10 text-red-600 border-red-200';
    if (dias <= 15) return 'bg-amber-500/10 text-amber-600 border-amber-200';
    return 'bg-yellow-500/10 text-yellow-600 border-yellow-200';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <CalendarClock className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Control de Vencimientos</h1>
          <p className="text-muted-foreground text-sm">
            Monitoreo de habilitaciones próximas a vencer
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
              <Clock className="h-4 w-4" />
              Por Vencer (30 días)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-amber-600">{porVencer.length}</span>
          </CardContent>
        </Card>
        <Card className="border-red-200 bg-red-50/50 dark:bg-red-950/20">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2 text-red-700 dark:text-red-400">
              <AlertTriangle className="h-4 w-4" />
              Vencidos
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-red-600">{vencidos.length}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Al día
            </CardDescription>
          </CardHeader>
          <CardContent>
            <span className="text-3xl font-bold text-green-600">45</span>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="por_vencer">
        <TabsList>
          <TabsTrigger value="por_vencer" className="gap-2">
            <Clock className="h-4 w-4" />
            Por Vencer ({porVencer.length})
          </TabsTrigger>
          <TabsTrigger value="vencidos" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Vencidos ({vencidos.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="por_vencer" className="mt-4">
          <div className="grid gap-3">
            {porVencer.map((item) => (
              <Card key={item.id} className="hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-5 w-5 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{item.empleado}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {item.habilitacion}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className={getUrgencyColor(item.diasRestantes)}>
                        {item.diasRestantes} días
                      </Badge>
                      <Button size="sm" variant="outline">
                        Renovar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="vencidos" className="mt-4">
          <div className="grid gap-3">
            {vencidos.map((item) => (
              <Card key={item.id} className="border-red-200 hover:shadow-md transition-shadow">
                <CardContent className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center">
                        <AlertTriangle className="h-5 w-5 text-red-600" />
                      </div>
                      <div>
                        <p className="font-medium">{item.empleado}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <FileText className="h-3 w-3" />
                          {item.habilitacion}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge variant="destructive">
                        Vencido hace {Math.abs(item.diasRestantes)} días
                      </Badge>
                      <Button size="sm">
                        Renovar Urgente
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

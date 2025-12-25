import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Search, FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import { useState } from 'react';

// Datos mock mientras no haya tabla en Supabase
const mockPartes = [
  { id: '1', equipo: 'Excavadora CAT 320D', fecha: '2024-01-15', horas: 8.5, operador: 'Juan Pérez', obra: 'Proyecto Norte', estado: 'aprobado' },
  { id: '2', equipo: 'Retroexcavadora JCB 3CX', fecha: '2024-01-15', horas: 6.0, operador: 'Carlos López', obra: 'Edificio Central', estado: 'pendiente' },
  { id: '3', equipo: 'Camión Volvo FH16', fecha: '2024-01-14', horas: 10.0, operador: 'Miguel Ruiz', obra: 'Proyecto Norte', estado: 'aprobado' },
  { id: '4', equipo: 'Grúa Liebherr LTM', fecha: '2024-01-14', horas: 4.5, operador: 'Pedro Gómez', obra: 'Puerto Sur', estado: 'rechazado' },
];

const estadoConfig = {
  pendiente: { label: 'Pendiente', variant: 'outline' as const, icon: Clock },
  aprobado: { label: 'Aprobado', variant: 'default' as const, icon: CheckCircle },
  rechazado: { label: 'Rechazado', variant: 'destructive' as const, icon: AlertCircle },
};

export default function PartesEquipos() {
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<string>('todos');

  const partesFiltrados = mockPartes.filter(parte => {
    const matchBusqueda = parte.equipo.toLowerCase().includes(busqueda.toLowerCase()) ||
      parte.operador.toLowerCase().includes(busqueda.toLowerCase()) ||
      parte.obra.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === 'todos' || parte.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  const stats = {
    total: mockPartes.length,
    pendientes: mockPartes.filter(p => p.estado === 'pendiente').length,
    aprobados: mockPartes.filter(p => p.estado === 'aprobado').length,
    horasTotales: mockPartes.reduce((acc, p) => acc + p.horas, 0),
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Partes de Equipos</h1>
          <p className="text-muted-foreground">Registro diario de uso de equipos y maquinaria</p>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Parte
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Partes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-warning/10">
                <Clock className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pendientes}</p>
                <p className="text-sm text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-success/10">
                <CheckCircle className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.aprobados}</p>
                <p className="text-sm text-muted-foreground">Aprobados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-secondary">
                <FileText className="h-5 w-5 text-secondary-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.horasTotales}h</p>
                <p className="text-sm text-muted-foreground">Horas Totales</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros y tabla */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar por equipo, operador u obra..." 
                className="pl-9"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
            </div>
            <Select value={filtroEstado} onValueChange={setFiltroEstado}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="aprobado">Aprobado</SelectItem>
                <SelectItem value="rechazado">Rechazado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Equipo</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead>Obra</TableHead>
                <TableHead className="text-right">Horas</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {partesFiltrados.map((parte) => {
                const config = estadoConfig[parte.estado as keyof typeof estadoConfig];
                const IconEstado = config.icon;
                return (
                  <TableRow key={parte.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{parte.equipo}</TableCell>
                    <TableCell>{parte.fecha}</TableCell>
                    <TableCell>{parte.operador}</TableCell>
                    <TableCell>{parte.obra}</TableCell>
                    <TableCell className="text-right">{parte.horas}h</TableCell>
                    <TableCell>
                      <Badge variant={config.variant} className="gap-1">
                        <IconEstado className="h-3 w-3" />
                        {config.label}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {partesFiltrados.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No se encontraron partes de equipos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

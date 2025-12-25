import { useState } from 'react';
import { History, Search, Calendar, Download, Eye, Truck, User } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Datos de ejemplo
const historialDemo = [
  { id: '1', fecha: '2024-12-24', equipo: 'Camión Volvo FH16', operador: 'Juan Pérez', horasTrabajadas: 8, kmRecorridos: 245, estado: 'aprobado' },
  { id: '2', fecha: '2024-12-24', equipo: 'Excavadora CAT 320', operador: 'Carlos López', horasTrabajadas: 6, kmRecorridos: 0, estado: 'aprobado' },
  { id: '3', fecha: '2024-12-23', equipo: 'Grúa Liebherr LTM', operador: 'Roberto Sánchez', horasTrabajadas: 10, kmRecorridos: 15, estado: 'pendiente' },
  { id: '4', fecha: '2024-12-23', equipo: 'Camioneta Toyota Hilux', operador: 'María García', horasTrabajadas: 9, kmRecorridos: 180, estado: 'aprobado' },
  { id: '5', fecha: '2024-12-22', equipo: 'Camión Volvo FH16', operador: 'Juan Pérez', horasTrabajadas: 7, kmRecorridos: 320, estado: 'aprobado' },
];

const estadoColors: Record<string, string> = {
  aprobado: 'bg-green-500/10 text-green-600 border-green-200',
  pendiente: 'bg-amber-500/10 text-amber-600 border-amber-200',
  rechazado: 'bg-red-500/10 text-red-600 border-red-200',
};

export default function HistorialPartes() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredHistorial = historialDemo.filter(
    (p) =>
      p.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.operador.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <History className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Historial de Partes</h1>
            <p className="text-muted-foreground text-sm">
              {filteredHistorial.length} registros encontrados
            </p>
          </div>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Exportar
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por equipo u operador..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Input type="date" className="w-auto" />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Operador</TableHead>
                <TableHead className="text-center">Horas</TableHead>
                <TableHead className="text-center">Km</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredHistorial.map((parte) => (
                <TableRow key={parte.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      {new Date(parte.fecha).toLocaleDateString('es-AR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{parte.equipo}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      {parte.operador}
                    </div>
                  </TableCell>
                  <TableCell className="text-center">{parte.horasTrabajadas}h</TableCell>
                  <TableCell className="text-center">{parte.kmRecorridos} km</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={estadoColors[parte.estado]}>
                      {parte.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

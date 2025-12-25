import { useState } from 'react';
import { Truck, Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

// Datos de ejemplo
const equiposDemo = [
  { id: '1', codigo: 'EQ-001', nombre: 'Camión Volvo FH16', tipo: 'Camión', estado: 'activo', ubicacion: 'Base Central', ultimoService: '2024-12-01' },
  { id: '2', codigo: 'EQ-002', nombre: 'Excavadora CAT 320', tipo: 'Maquinaria', estado: 'mantenimiento', ubicacion: 'Obra Norte', ultimoService: '2024-11-15' },
  { id: '3', codigo: 'EQ-003', nombre: 'Grúa Liebherr LTM', tipo: 'Grúa', estado: 'activo', ubicacion: 'Puerto', ultimoService: '2024-12-10' },
  { id: '4', codigo: 'EQ-004', nombre: 'Retroexcavadora JCB', tipo: 'Maquinaria', estado: 'inactivo', ubicacion: 'Depósito', ultimoService: '2024-10-20' },
  { id: '5', codigo: 'EQ-005', nombre: 'Camioneta Toyota Hilux', tipo: 'Vehículo', estado: 'activo', ubicacion: 'Móvil', ultimoService: '2024-12-05' },
];

const estadoColors: Record<string, string> = {
  activo: 'bg-green-500/10 text-green-600 border-green-200',
  mantenimiento: 'bg-amber-500/10 text-amber-600 border-amber-200',
  inactivo: 'bg-gray-500/10 text-gray-600 border-gray-200',
};

export default function EquiposListado() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredEquipos = equiposDemo.filter(
    (e) =>
      e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Listado de Equipos</h1>
            <p className="text-muted-foreground text-sm">
              {filteredEquipos.length} equipos registrados
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Equipo
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por código o nombre..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="icon">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Último Service</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEquipos.map((equipo) => (
                <TableRow key={equipo.id}>
                  <TableCell className="font-mono text-sm">{equipo.codigo}</TableCell>
                  <TableCell className="font-medium">{equipo.nombre}</TableCell>
                  <TableCell>{equipo.tipo}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={estadoColors[equipo.estado]}>
                      {equipo.estado}
                    </Badge>
                  </TableCell>
                  <TableCell>{equipo.ubicacion}</TableCell>
                  <TableCell>{new Date(equipo.ultimoService).toLocaleDateString('es-AR')}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver detalle
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="h-4 w-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
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

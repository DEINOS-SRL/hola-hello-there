import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  ArrowLeftRight,
  CheckCircle,
  Clock,
  Truck
} from 'lucide-react';

interface Movimiento {
  id: string;
  codigo: string;
  equipo: string;
  origen: string;
  destino: string;
  fechaSalida: string;
  fechaLlegada?: string;
  estado: 'Pendiente' | 'En tránsito' | 'Completado' | 'Cancelado';
  responsable: string;
  observaciones?: string;
}

const mockMovimientos: Movimiento[] = [
  { 
    id: '1', 
    codigo: 'MOV-2024-001', 
    equipo: 'Camión Volvo FH16 #12', 
    origen: 'Base Central', 
    destino: 'Obra Norte - Sector A', 
    fechaSalida: '2024-12-25 08:30',
    estado: 'En tránsito',
    responsable: 'Juan Pérez'
  },
  { 
    id: '2', 
    codigo: 'MOV-2024-002', 
    equipo: 'Retroexcavadora CAT 420F', 
    origen: 'Obra Sur', 
    destino: 'Taller Mecánico', 
    fechaSalida: '2024-12-25 07:45',
    fechaLlegada: '2024-12-25 09:30',
    estado: 'Completado',
    responsable: 'Carlos García',
    observaciones: 'Traslado por mantenimiento programado'
  },
  { 
    id: '3', 
    codigo: 'MOV-2024-003', 
    equipo: 'Grúa Liebherr LTM 1100', 
    origen: 'Puerto', 
    destino: 'Obra Centro', 
    fechaSalida: '2024-12-25 10:00',
    estado: 'Pendiente',
    responsable: 'Miguel López'
  },
  { 
    id: '4', 
    codigo: 'MOV-2024-004', 
    equipo: 'Mixer Hormigonera #5', 
    origen: 'Planta Hormigón', 
    destino: 'Obra Norte - Sector B', 
    fechaSalida: '2024-12-25 08:15',
    estado: 'En tránsito',
    responsable: 'Pedro Martínez'
  },
  { 
    id: '5', 
    codigo: 'MOV-2024-005', 
    equipo: 'Compactadora Bomag', 
    origen: 'Obra Este', 
    destino: 'Base Central', 
    fechaSalida: '2024-12-24 16:00',
    fechaLlegada: '2024-12-24 18:30',
    estado: 'Completado',
    responsable: 'Roberto Sánchez'
  },
];

const getEstadoBadge = (estado: Movimiento['estado']) => {
  const config: Record<Movimiento['estado'], { variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof CheckCircle }> = {
    'Completado': { variant: 'default', icon: CheckCircle },
    'En tránsito': { variant: 'secondary', icon: Truck },
    'Pendiente': { variant: 'outline', icon: Clock },
    'Cancelado': { variant: 'destructive', icon: Trash2 },
  };
  const { variant, icon: Icon } = config[estado];
  return (
    <Badge variant={variant} className="gap-1">
      <Icon className="h-3 w-3" />
      {estado}
    </Badge>
  );
};

export default function MovimientosPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [movimientos] = useState<Movimiento[]>(mockMovimientos);

  const filteredMovimientos = movimientos.filter(mov => 
    mov.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mov.equipo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mov.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mov.destino.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Movimientos</h1>
          <p className="text-muted-foreground">Gestión de traslados de equipos y recursos</p>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Movimiento
        </Button>
      </div>

      {/* Stats rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{movimientos.length}</p>
                <p className="text-xs text-muted-foreground">Total movimientos</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{movimientos.filter(m => m.estado === 'Pendiente').length}</p>
                <p className="text-xs text-muted-foreground">Pendientes</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <Truck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{movimientos.filter(m => m.estado === 'En tránsito').length}</p>
                <p className="text-xs text-muted-foreground">En tránsito</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{movimientos.filter(m => m.estado === 'Completado').length}</p>
                <p className="text-xs text-muted-foreground">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabla */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-lg">Lista de Movimientos</CardTitle>
              <CardDescription>Registro de todos los traslados</CardDescription>
            </div>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar movimiento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9 w-[250px]"
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Equipo</TableHead>
                <TableHead>Origen → Destino</TableHead>
                <TableHead>Fecha Salida</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Responsable</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMovimientos.map((mov) => (
                <TableRow key={mov.id}>
                  <TableCell className="font-mono text-sm">{mov.codigo}</TableCell>
                  <TableCell className="font-medium">{mov.equipo}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <span className="text-muted-foreground">{mov.origen}</span>
                      <span className="text-primary">→</span>
                      <span>{mov.destino}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">{mov.fechaSalida}</TableCell>
                  <TableCell>{getEstadoBadge(mov.estado)}</TableCell>
                  <TableCell className="text-sm">{mov.responsable}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-popover border shadow-lg z-50">
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
              {filteredMovimientos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No se encontraron movimientos
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

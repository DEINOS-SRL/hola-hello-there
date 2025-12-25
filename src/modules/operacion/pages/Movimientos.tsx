import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Edit, Trash2, ArrowLeftRight, Loader2, Clock, Truck, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMovimientos } from '../hooks/useMovimientos';
import { MovimientoModal } from '../components/MovimientoModal';
import type { Movimiento, MovimientoInsert, EstadoMovimiento } from '../types';

const estadoColors: Record<EstadoMovimiento, string> = {
  pendiente: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  en_transito: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  completado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const estadoLabels: Record<EstadoMovimiento, string> = {
  pendiente: 'Pendiente',
  en_transito: 'En Tránsito',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

const tipoLabels: Record<string, string> = {
  traslado: 'Traslado',
  prestamo: 'Préstamo',
  mantenimiento: 'Mantenimiento',
  baja: 'Baja',
  alta: 'Alta',
};

export default function Movimientos() {
  const { movimientos, isLoading, createMovimiento, updateMovimiento, deleteMovimiento, isCreating, isUpdating } = useMovimientos();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState<Movimiento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movimientoToDelete, setMovimientoToDelete] = useState<string | null>(null);

  const filteredMovimientos = movimientos.filter((mov) => {
    const matchesSearch =
      mov.equipo_descripcion.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.origen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      mov.destino.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mov.responsable_nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesEstado = estadoFilter === 'all' || mov.estado === estadoFilter;
    
    return matchesSearch && matchesEstado;
  });

  const stats = {
    total: movimientos.length,
    pendientes: movimientos.filter(m => m.estado === 'pendiente').length,
    enTransito: movimientos.filter(m => m.estado === 'en_transito').length,
    completados: movimientos.filter(m => m.estado === 'completado').length,
  };

  const handleNew = () => {
    setSelectedMovimiento(null);
    setModalOpen(true);
  };

  const handleEdit = (movimiento: Movimiento) => {
    setSelectedMovimiento(movimiento);
    setModalOpen(true);
  };

  const handleSave = async (data: MovimientoInsert) => {
    if (selectedMovimiento) {
      await updateMovimiento({ id: selectedMovimiento.id, data });
    } else {
      await createMovimiento(data);
    }
  };

  const handleDeleteClick = (id: string) => {
    setMovimientoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (movimientoToDelete) {
      await deleteMovimiento(movimientoToDelete);
      setDeleteDialogOpen(false);
      setMovimientoToDelete(null);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos</h1>
          <p className="text-muted-foreground">Gestiona los traslados y movimientos de equipos</p>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Movimiento
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <ArrowLeftRight className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
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
                <p className="text-2xl font-bold">{stats.pendientes}</p>
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
                <p className="text-2xl font-bold">{stats.enTransito}</p>
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
                <p className="text-2xl font-bold">{stats.completados}</p>
                <p className="text-xs text-muted-foreground">Completados</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowLeftRight className="h-5 w-5 text-primary" />
            Registro de Movimientos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por equipo, origen, destino..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los estados</SelectItem>
                <SelectItem value="pendiente">Pendiente</SelectItem>
                <SelectItem value="en_transito">En Tránsito</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
                <SelectItem value="cancelado">Cancelado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredMovimientos.length === 0 ? (
            <div className="text-center py-12">
              <ArrowLeftRight className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium">No hay movimientos</h3>
              <p className="text-muted-foreground mb-4">
                {searchTerm || estadoFilter !== 'all'
                  ? 'No se encontraron movimientos con los filtros aplicados'
                  : 'Comienza registrando un nuevo movimiento'}
              </p>
              {!searchTerm && estadoFilter === 'all' && (
                <Button onClick={handleNew} variant="outline">
                  <Plus className="h-4 w-4 mr-2" />
                  Nuevo Movimiento
                </Button>
              )}
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Equipo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Origen → Destino</TableHead>
                    <TableHead>Responsable</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovimientos.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="font-medium">{mov.equipo_descripcion}</TableCell>
                      <TableCell>{tipoLabels[mov.tipo] || mov.tipo}</TableCell>
                      <TableCell>
                        <span className="text-muted-foreground">{mov.origen}</span>
                        <span className="mx-2">→</span>
                        <span>{mov.destino}</span>
                      </TableCell>
                      <TableCell>{mov.responsable_nombre || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(mov.fecha_solicitud), 'dd/MM/yyyy', { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge className={estadoColors[mov.estado]} variant="secondary">
                          {estadoLabels[mov.estado]}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(mov)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(mov.id)}
                              className="text-destructive"
                            >
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
            </div>
          )}
        </CardContent>
      </Card>

      <MovimientoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        movimiento={selectedMovimiento}
        onSave={handleSave}
        isLoading={isCreating || isUpdating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El movimiento será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive text-destructive-foreground">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

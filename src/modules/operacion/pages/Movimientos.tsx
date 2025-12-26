import { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Edit, Trash2, ArrowLeftRight, Loader2, Clock, Truck, CheckCircle, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useMovimientos } from '../hooks/useMovimientos';
import { WizardMovimiento } from '../components/wizard';
import { useActionParam } from '@/hooks/useActionParam';
import type { Movimiento, EstadoMovimiento } from '../types';

const estadoColors: Record<EstadoMovimiento, string> = {
  generado: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  asignacion_recursos: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  planificado: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  en_ejecucion: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  cierre_operativo: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  completado: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  cancelado: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
};

const estadoLabels: Record<EstadoMovimiento, string> = {
  generado: 'Generado',
  asignacion_recursos: 'Asignación',
  planificado: 'Planificado',
  en_ejecucion: 'En Ejecución',
  cierre_operativo: 'Cierre',
  completado: 'Completado',
  cancelado: 'Cancelado',
};

export default function Movimientos() {
  const { movimientos, isLoading, deleteMovimiento, refetch } = useMovimientos();
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('all');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedMovimiento, setSelectedMovimiento] = useState<Movimiento | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [movimientoToDelete, setMovimientoToDelete] = useState<string | null>(null);

  const handleAction = useCallback((action: string, id?: string) => {
    if (action === 'new') {
      setSelectedMovimiento(null);
      setWizardOpen(true);
    } else if (action === 'edit' && id) {
      const movimiento = movimientos.find(m => m.id === id);
      if (movimiento) {
        setSelectedMovimiento(movimiento);
        setWizardOpen(true);
      }
    }
  }, [movimientos]);

  useActionParam({ onAction: handleAction });

  const filteredMovimientos = movimientos.filter((mov) => {
    const matchesSearch =
      mov.asunto.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (mov.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false) ||
      (mov.solicitante?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
    
    const matchesEstado = estadoFilter === 'all' || mov.estado === estadoFilter;
    
    return matchesSearch && matchesEstado;
  });

  const stats = {
    total: movimientos.length,
    generados: movimientos.filter(m => m.estado === 'generado').length,
    enEjecucion: movimientos.filter(m => m.estado === 'en_ejecucion').length,
    completados: movimientos.filter(m => m.estado === 'completado').length,
  };

  const handleNew = () => {
    setSelectedMovimiento(null);
    setWizardOpen(true);
  };

  const handleEdit = (movimiento: Movimiento) => {
    setSelectedMovimiento(movimiento);
    setWizardOpen(true);
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

  const handleWizardComplete = () => {
    refetch();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Movimientos</h1>
          <p className="text-muted-foreground">Gestiona operaciones y servicios</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            vibe Coding
          </Button>
          <Button onClick={handleNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Movimiento
          </Button>
        </div>
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
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-900/30">
                <Clock className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.generados}</p>
                <p className="text-xs text-muted-foreground">Generados</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30">
                <Truck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.enEjecucion}</p>
                <p className="text-xs text-muted-foreground">En Ejecución</p>
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
                placeholder="Buscar por asunto, ubicación..."
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
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="generado">Generado</SelectItem>
                <SelectItem value="asignacion_recursos">Asignación</SelectItem>
                <SelectItem value="planificado">Planificado</SelectItem>
                <SelectItem value="en_ejecucion">En Ejecución</SelectItem>
                <SelectItem value="cierre_operativo">Cierre</SelectItem>
                <SelectItem value="completado">Completado</SelectItem>
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
                    <TableHead>#</TableHead>
                    <TableHead>Asunto</TableHead>
                    <TableHead>Ubicación</TableHead>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Estado</TableHead>
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredMovimientos.map((mov) => (
                    <TableRow key={mov.id}>
                      <TableCell className="font-medium">{mov.numero_movimiento}</TableCell>
                      <TableCell>{mov.asunto}</TableCell>
                      <TableCell>{mov.ubicacion || '-'}</TableCell>
                      <TableCell>{mov.solicitante || '-'}</TableCell>
                      <TableCell>
                        {format(new Date(mov.fecha_movimiento), 'dd/MM/yyyy', { locale: es })}
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
                              <Eye className="h-4 w-4 mr-2" />
                              Ver / Continuar
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

      <WizardMovimiento
        open={wizardOpen}
        onOpenChange={setWizardOpen}
        movimiento={selectedMovimiento}
        onComplete={handleWizardComplete}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar movimiento?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
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

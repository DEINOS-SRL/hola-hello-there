import { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  FileSpreadsheet, Plus, Search, Filter, MoreHorizontal, 
  Pencil, Trash2, Eye, Loader2, ArrowUpDown 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { usePresupuestos, useDeletePresupuesto } from '../hooks/usePresupuestos';
import { PresupuestoModal } from '../components/PresupuestoModal';
import type { Presupuesto, EstadoPresupuesto } from '../types';

const estadoConfig: Record<EstadoPresupuesto, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  borrador: { label: 'Borrador', variant: 'secondary' },
  enviado: { label: 'Enviado', variant: 'default' },
  aprobado: { label: 'Aprobado', variant: 'default' },
  rechazado: { label: 'Rechazado', variant: 'destructive' },
  vencido: { label: 'Vencido', variant: 'outline' },
};

const estadoColors: Record<EstadoPresupuesto, string> = {
  borrador: 'bg-gray-100 text-gray-700 border-gray-300',
  enviado: 'bg-blue-100 text-blue-700 border-blue-300',
  aprobado: 'bg-green-100 text-green-700 border-green-300',
  rechazado: 'bg-red-100 text-red-700 border-red-300',
  vencido: 'bg-orange-100 text-orange-700 border-orange-300',
};

export default function Presupuestos() {
  const { data: presupuestos, isLoading, error } = usePresupuestos();
  const deleteMutation = useDeletePresupuesto();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<EstadoPresupuesto | 'all'>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPresupuesto, setSelectedPresupuesto] = useState<Presupuesto | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [presupuestoToDelete, setPresupuestoToDelete] = useState<Presupuesto | null>(null);
  const [sortField, setSortField] = useState<'fecha' | 'monto_total' | 'numero'>('fecha');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredPresupuestos = useMemo(() => {
    if (!presupuestos) return [];
    
    let filtered = presupuestos.filter((p) => {
      const matchesSearch = 
        p.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.cliente.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesEstado = estadoFilter === 'all' || p.estado === estadoFilter;
      
      return matchesSearch && matchesEstado;
    });

    // Ordenar
    filtered.sort((a, b) => {
      let comparison = 0;
      if (sortField === 'fecha') {
        comparison = new Date(a.fecha).getTime() - new Date(b.fecha).getTime();
      } else if (sortField === 'monto_total') {
        comparison = a.monto_total - b.monto_total;
      } else if (sortField === 'numero') {
        comparison = a.numero.localeCompare(b.numero);
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

    return filtered;
  }, [presupuestos, searchTerm, estadoFilter, sortField, sortOrder]);

  const handleSort = (field: 'fecha' | 'monto_total' | 'numero') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleEdit = (presupuesto: Presupuesto) => {
    setSelectedPresupuesto(presupuesto);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedPresupuesto(null);
    setModalOpen(true);
  };

  const handleDelete = (presupuesto: Presupuesto) => {
    setPresupuestoToDelete(presupuesto);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (presupuestoToDelete) {
      await deleteMutation.mutateAsync(presupuestoToDelete.id);
      setDeleteDialogOpen(false);
      setPresupuestoToDelete(null);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
    }).format(amount);
  };

  // Estadísticas
  const stats = useMemo(() => {
    if (!presupuestos) return { total: 0, aprobados: 0, pendientes: 0, montoTotal: 0 };
    
    return {
      total: presupuestos.length,
      aprobados: presupuestos.filter(p => p.estado === 'aprobado').length,
      pendientes: presupuestos.filter(p => p.estado === 'borrador' || p.estado === 'enviado').length,
      montoTotal: presupuestos.reduce((sum, p) => sum + p.monto_total, 0),
    };
  }, [presupuestos]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-blue-100">
            <FileSpreadsheet className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Presupuestos</h1>
            <p className="text-muted-foreground">
              Gestión de presupuestos y cotizaciones
            </p>
          </div>
        </div>
        <Button onClick={handleNew} className="gap-2">
          <Plus className="h-4 w-4" />
          Nuevo Presupuesto
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total</CardDescription>
            <CardTitle className="text-2xl">{stats.total}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Aprobados</CardDescription>
            <CardTitle className="text-2xl text-green-600">{stats.aprobados}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pendientes</CardDescription>
            <CardTitle className="text-2xl text-blue-600">{stats.pendientes}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Monto Total</CardDescription>
            <CardTitle className="text-xl">{formatCurrency(stats.montoTotal)}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Buscar por número, cliente..." 
            className="pl-9"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={estadoFilter} onValueChange={(v) => setEstadoFilter(v as EstadoPresupuesto | 'all')}>
          <SelectTrigger className="w-[180px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filtrar estado" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos los estados</SelectItem>
            {Object.entries(estadoConfig).map(([value, config]) => (
              <SelectItem key={value} value={value}>{config.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-destructive">Error al cargar presupuestos</p>
              <p className="text-sm text-muted-foreground">{error.message}</p>
            </div>
          ) : filteredPresupuestos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 rounded-full bg-muted mb-4">
                <FileSpreadsheet className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-medium mb-2">Sin presupuestos</h3>
              <p className="text-muted-foreground max-w-sm">
                {searchTerm || estadoFilter !== 'all' 
                  ? 'No se encontraron presupuestos con los filtros aplicados'
                  : 'Crea tu primer presupuesto haciendo clic en "Nuevo Presupuesto"'}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('numero')} className="gap-1 -ml-3">
                      Número
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>
                    <Button variant="ghost" size="sm" onClick={() => handleSort('fecha')} className="gap-1 -ml-3">
                      Fecha
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => handleSort('monto_total')} className="gap-1">
                      Monto
                      <ArrowUpDown className="h-3 w-3" />
                    </Button>
                  </TableHead>
                  <TableHead className="w-[70px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPresupuestos.map((presupuesto) => (
                  <TableRow key={presupuesto.id}>
                    <TableCell className="font-medium">{presupuesto.numero}</TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{presupuesto.cliente}</p>
                        {presupuesto.descripcion && (
                          <p className="text-sm text-muted-foreground line-clamp-1">
                            {presupuesto.descripcion}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      {format(new Date(presupuesto.fecha), 'dd/MM/yyyy', { locale: es })}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className={cn('border', estadoColors[presupuesto.estado])}
                      >
                        {estadoConfig[presupuesto.estado].label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(presupuesto.monto_total)}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(presupuesto)}>
                            <Eye className="h-4 w-4 mr-2" />
                            Ver detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEdit(presupuesto)}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(presupuesto)}
                            className="text-destructive focus:text-destructive"
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
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <PresupuestoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        presupuesto={selectedPresupuesto}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar presupuesto?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el presupuesto 
              <strong> {presupuestoToDelete?.numero}</strong> y todos sus ítems.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

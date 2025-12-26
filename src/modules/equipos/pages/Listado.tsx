import { useState, useMemo } from 'react';
import {
  Search,
  Plus,
  Filter,
  MoreHorizontal,
  Edit,
  Trash2,
  Eye,
  Truck,
  Wrench,
  AlertTriangle,
  CheckCircle,
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useEquipos, useDeleteEquipo, useTiposEquipo } from '../hooks/useEquipos';
import { EquipoModal } from '../components/EquipoModal';
import type { Equipo, EstadoEquipo } from '../types';

const estadoConfig: Record<EstadoEquipo, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: React.ElementType }> = {
  activo: { label: 'Activo', variant: 'default', icon: CheckCircle },
  inactivo: { label: 'Inactivo', variant: 'secondary', icon: AlertTriangle },
  mantenimiento: { label: 'En Mantenimiento', variant: 'outline', icon: Wrench },
  baja: { label: 'Baja', variant: 'destructive', icon: Trash2 },
};

export default function EquiposListado() {
  const { data: equipos = [], isLoading, error } = useEquipos();
  const { data: tiposEquipo = [] } = useTiposEquipo();
  const deleteEquipo = useDeleteEquipo();

  const [searchTerm, setSearchTerm] = useState('');
  const [estadoFilter, setEstadoFilter] = useState<string>('todos');
  const [tipoFilter, setTipoFilter] = useState<string>('todos');
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEquipo, setSelectedEquipo] = useState<Equipo | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [equipoToDelete, setEquipoToDelete] = useState<Equipo | null>(null);

  const filteredEquipos = useMemo(() => {
    return equipos.filter((equipo) => {
      const matchesSearch =
        equipo.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.numero_serie?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        equipo.ubicacion?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesEstado = estadoFilter === 'todos' || equipo.estado === estadoFilter;
      const matchesTipo = tipoFilter === 'todos' || equipo.tipo_equipo_id === tipoFilter;

      return matchesSearch && matchesEstado && matchesTipo;
    });
  }, [equipos, searchTerm, estadoFilter, tipoFilter]);

  const stats = useMemo(() => {
    const total = equipos.length;
    const activos = equipos.filter((e) => e.estado === 'activo').length;
    const mantenimiento = equipos.filter((e) => e.estado === 'mantenimiento').length;
    const inactivos = equipos.filter((e) => e.estado === 'inactivo' || e.estado === 'baja').length;

    return { total, activos, mantenimiento, inactivos };
  }, [equipos]);

  const handleEdit = (equipo: Equipo) => {
    setSelectedEquipo(equipo);
    setModalOpen(true);
  };

  const handleNew = () => {
    setSelectedEquipo(null);
    setModalOpen(true);
  };

  const handleDelete = (equipo: Equipo) => {
    setEquipoToDelete(equipo);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (equipoToDelete) {
      await deleteEquipo.mutateAsync(equipoToDelete.id);
      setDeleteDialogOpen(false);
      setEquipoToDelete(null);
    }
  };

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error al cargar equipos: {error.message}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Truck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-foreground">Listado de Equipos</h1>
            <p className="text-muted-foreground">Gestión del maestro de equipos</p>
          </div>
        </div>
        <Button onClick={handleNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Equipo
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Equipos</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Activos</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.activos}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Mantenimiento</CardTitle>
            <Wrench className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-500">{stats.mantenimiento}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inactivos/Baja</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.inactivos}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Buscar por código, nombre, serie, ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={estadoFilter} onValueChange={setEstadoFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los estados</SelectItem>
                {Object.entries(estadoConfig).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="mr-2 h-4 w-4" />
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos los tipos</SelectItem>
                {tiposEquipo.map((tipo) => (
                  <SelectItem key={tipo.id} value={tipo.id}>
                    {tipo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Equipos</CardTitle>
          <CardDescription>
            {filteredEquipos.length} de {equipos.length} equipos
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : filteredEquipos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Truck className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">No se encontraron equipos</p>
              <Button variant="link" onClick={handleNew} className="mt-2">
                Crear el primer equipo
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Marca / Modelo</TableHead>
                  <TableHead>N° Serie</TableHead>
                  <TableHead>Ubicación</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEquipos.map((equipo) => {
                  const estadoInfo = estadoConfig[equipo.estado];
                  const EstadoIcon = estadoInfo.icon;

                  return (
                    <TableRow key={equipo.id}>
                      <TableCell className="font-mono font-medium">
                        {equipo.codigo}
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="font-medium">{equipo.nombre}</p>
                          {equipo.descripcion && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {equipo.descripcion}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{equipo.tipo_equipo?.nombre || '-'}</TableCell>
                      <TableCell>
                        {equipo.marca?.nombre || equipo.modelo?.nombre ? (
                          <div>
                            <p>{equipo.marca?.nombre || '-'}</p>
                            {equipo.modelo?.nombre && (
                              <p className="text-xs text-muted-foreground">
                                {equipo.modelo.nombre}
                              </p>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </TableCell>
                      <TableCell className="font-mono text-sm">
                        {equipo.numero_serie || '-'}
                      </TableCell>
                      <TableCell>{equipo.ubicacion || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={estadoInfo.variant} className="gap-1">
                          <EstadoIcon className="h-3 w-3" />
                          {estadoInfo.label}
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
                            <DropdownMenuItem onClick={() => handleEdit(equipo)}>
                              <Eye className="mr-2 h-4 w-4" />
                              Ver detalle
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEdit(equipo)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              className="text-destructive"
                              onClick={() => handleDelete(equipo)}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal */}
      <EquipoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        equipo={selectedEquipo}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción marcará el equipo "{equipoToDelete?.nombre}" como inactivo.
              Podrá ser restaurado posteriormente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

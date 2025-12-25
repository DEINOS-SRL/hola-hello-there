import { useState, useMemo, useCallback } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, Loader2, UserCheck, Clock, UserX } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { useEmpleados } from '../hooks/useEmpleados';
import { EmpleadoModal } from '../components/EmpleadoModal';
import { useAuth } from '@/contexts/AuthContext';
import { useActionParam } from '@/hooks/useActionParam';
import type { Empleado } from '../types';

const estadoBadgeVariant: Record<string, 'default' | 'secondary' | 'destructive'> = {
  activo: 'default',
  licencia: 'secondary',
  baja: 'destructive',
};

const estadoLabels: Record<string, string> = {
  activo: 'Activo',
  licencia: 'Licencia',
  baja: 'Baja',
};

export default function Empleados() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmpleado, setEditingEmpleado] = useState<Empleado | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [empleadoToDelete, setEmpleadoToDelete] = useState<Empleado | null>(null);

  const { user } = useAuth();
  const {
    empleados,
    isLoading,
    error,
    create,
    update,
    remove,
    updateEstado,
    isCreating,
    isUpdating,
  } = useEmpleados();

  // Detectar ?action=new para abrir modal automáticamente
  const handleAction = useCallback((action: string) => {
    if (action === 'new') {
      setEditingEmpleado(null);
      setModalOpen(true);
    }
  }, []);

  useActionParam({ onAction: handleAction });

  const filtered = useMemo(() => {
    if (!searchTerm) return empleados;
    const term = searchTerm.toLowerCase();
    return empleados.filter(
      (e) =>
        e.nombre.toLowerCase().includes(term) ||
        e.apellido.toLowerCase().includes(term) ||
        e.dni?.toLowerCase().includes(term) ||
        e.legajo?.toLowerCase().includes(term) ||
        e.email?.toLowerCase().includes(term)
    );
  }, [empleados, searchTerm]);

  const handleOpenCreate = () => {
    setEditingEmpleado(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (empleado: Empleado) => {
    setEditingEmpleado(empleado);
    setModalOpen(true);
  };

  const handleSubmit = async (data: any) => {
    if (editingEmpleado) {
      await update({ id: editingEmpleado.id, ...data });
    } else {
      // Necesitamos empresa_id del usuario actual
      const empresaId = user?.empresa_id;
      if (!empresaId) {
        throw new Error('No se pudo determinar la empresa del usuario');
      }
      await create({ ...data, empresa_id: empresaId });
    }
  };

  const handleConfirmDelete = async () => {
    if (empleadoToDelete) {
      await remove(empleadoToDelete.id);
    }
    setDeleteDialogOpen(false);
    setEmpleadoToDelete(null);
  };

  const handleEstadoChange = async (id: string, estado: 'activo' | 'licencia' | 'baja') => {
    await updateEstado({ id, estado });
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar empleados: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Empleados</h1>
          <p className="text-muted-foreground">Gestiona los empleados de tu empresa</p>
        </div>
        <Button onClick={handleOpenCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Empleado
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar empleados..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="outline">{filtered.length} empleados</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No se encontraron empleados</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empleado</TableHead>
                  <TableHead>Legajo</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Departamento</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((empleado) => (
                  <TableRow key={empleado.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {empleado.nombre[0]}
                            {empleado.apellido[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <span className="font-medium">
                            {empleado.nombre} {empleado.apellido}
                          </span>
                          {empleado.email && (
                            <p className="text-xs text-muted-foreground">{empleado.email}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {empleado.legajo || '-'}
                    </TableCell>
                    <TableCell>{empleado.cargo || '-'}</TableCell>
                    <TableCell>{empleado.departamento || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={estadoBadgeVariant[empleado.estado]}>
                        {estadoLabels[empleado.estado]}
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
                          <DropdownMenuItem onClick={() => handleOpenEdit(empleado)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {empleado.estado !== 'activo' && (
                            <DropdownMenuItem
                              onClick={() => handleEstadoChange(empleado.id, 'activo')}
                            >
                              <UserCheck className="mr-2 h-4 w-4" />
                              Marcar Activo
                            </DropdownMenuItem>
                          )}
                          {empleado.estado !== 'licencia' && (
                            <DropdownMenuItem
                              onClick={() => handleEstadoChange(empleado.id, 'licencia')}
                            >
                              <Clock className="mr-2 h-4 w-4" />
                              Marcar en Licencia
                            </DropdownMenuItem>
                          )}
                          {empleado.estado !== 'baja' && (
                            <DropdownMenuItem
                              onClick={() => handleEstadoChange(empleado.id, 'baja')}
                            >
                              <UserX className="mr-2 h-4 w-4" />
                              Dar de Baja
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => {
                              setEmpleadoToDelete(empleado);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
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

      <EmpleadoModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        empleado={editingEmpleado}
        onSubmit={handleSubmit}
        isSubmitting={isCreating || isUpdating}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar empleado?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente a{' '}
              {empleadoToDelete?.nombre} {empleadoToDelete?.apellido}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
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

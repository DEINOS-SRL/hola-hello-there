import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, LayoutGrid, MoreHorizontal, Edit, Trash2, Loader2, ToggleLeft, ToggleRight, ChevronRight } from 'lucide-react';
import { segClient } from '@/modules/security/services/segClient';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
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
import { useToast } from '@/hooks/use-toast';
import { ModuloModal } from '@/components/modals/ModuloModal';

export default function Modulos() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingModulo, setEditingModulo] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [moduloToDelete, setModuloToDelete] = useState<any>(null);
  const { toast } = useToast();

  const { data: modulos, isLoading, error, refetch } = useQuery({
    queryKey: ['modulos'],
    queryFn: async () => {
      const { data, error } = await segClient
        .from('modulos')
        .select('*, modulo_padre:modulo_padre_id(id, nombre)')
        .order('orden', { ascending: true })
        .order('nombre', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const toggleModuloStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await segClient
      .from('modulos')
      .update({ activo: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: `Módulo ${!currentStatus ? 'activado' : 'desactivado'}` });
      refetch();
    }
  };

  const confirmDelete = async () => {
    if (!moduloToDelete) return;
    
    const { error } = await segClient
      .from('modulos')
      .delete()
      .eq('id', moduloToDelete.id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el módulo', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Módulo eliminado' });
      refetch();
    }
    setDeleteDialogOpen(false);
    setModuloToDelete(null);
  };

  const openEditModal = (modulo: any) => {
    setEditingModulo(modulo);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingModulo(null);
    setModalOpen(true);
  };

  const filtered = modulos?.filter((m: any) => 
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  // Separar módulos principales y submódulos
  const modulosPrincipales = filtered.filter((m: any) => !m.modulo_padre_id);
  const submodulos = filtered.filter((m: any) => m.modulo_padre_id);

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar módulos</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Módulos</h1>
          <p className="text-muted-foreground">Gestiona los módulos de la plataforma</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Nuevo Módulo
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar módulos..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="outline">{filtered.length} módulos</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No se encontraron módulos</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Módulo Padre</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((modulo: any) => (
                  <TableRow key={modulo.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${modulo.modulo_padre_id ? 'bg-secondary' : 'bg-primary/10'}`}>
                          <LayoutGrid className={`h-4 w-4 ${modulo.modulo_padre_id ? 'text-secondary-foreground' : 'text-primary'}`} />
                        </div>
                        <div className="flex items-center gap-2">
                          {modulo.modulo_padre_id && <ChevronRight className="h-3 w-3 text-muted-foreground" />}
                          <span className="font-medium">{modulo.nombre}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px] truncate">
                      {modulo.descripcion || '-'}
                    </TableCell>
                    <TableCell>
                      {modulo.modulo_padre?.nombre ? (
                        <Badge variant="outline">{modulo.modulo_padre.nombre}</Badge>
                      ) : (
                        <span className="text-muted-foreground text-sm">Principal</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={modulo.activo ? 'default' : 'secondary'}>
                        {modulo.activo ? 'Activo' : 'Inactivo'}
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
                          <DropdownMenuItem onClick={() => openEditModal(modulo)}>
                            <Edit className="mr-2 h-4 w-4" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleModuloStatus(modulo.id, modulo.activo || false)}>
                            {modulo.activo ? (
                              <><ToggleLeft className="mr-2 h-4 w-4" />Desactivar</>
                            ) : (
                              <><ToggleRight className="mr-2 h-4 w-4" />Activar</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setModuloToDelete(modulo);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />Eliminar
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

      <ModuloModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        modulo={editingModulo}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar módulo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el módulo "{moduloToDelete?.nombre}".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

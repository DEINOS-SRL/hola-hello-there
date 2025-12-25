import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Key, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
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
import { RolModal } from '@/components/modals/RolModal';

export default function Roles() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRol, setEditingRol] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [rolToDelete, setRolToDelete] = useState<any>(null);
  const { toast } = useToast();

  const { data: roles, isLoading, error, refetch } = useQuery({
    queryKey: ['roles'],
    queryFn: async () => {
      const { data: rolesData, error: rolesError } = await supabase
        .from('seg_roles')
        .select(`*, seg_empresas(nombre)`)
        .order('nombre', { ascending: true });

      if (rolesError) throw rolesError;

      const { data: permCounts } = await supabase
        .from('seg_rol_permiso')
        .select('rol_id');

      const counts: Record<string, number> = {};
      permCounts?.forEach(p => {
        counts[p.rol_id] = (counts[p.rol_id] || 0) + 1;
      });

      return rolesData?.map(r => ({ ...r, permisos_count: counts[r.id] || 0 }));
    },
  });

  const confirmDelete = async () => {
    if (!rolToDelete) return;
    
    const { error } = await supabase
      .from('seg_roles')
      .delete()
      .eq('id', rolToDelete.id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el rol', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Rol eliminado' });
      refetch();
    }
    setDeleteDialogOpen(false);
    setRolToDelete(null);
  };

  const openEditModal = (rol: any) => {
    setEditingRol(rol);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingRol(null);
    setModalOpen(true);
  };

  const filtered = roles?.filter(r => 
    r.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar roles</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Roles</h1>
          <p className="text-muted-foreground">Gestiona los roles y permisos</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Nuevo Rol
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar roles..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="outline">{filtered.length} roles</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No se encontraron roles</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rol</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Permisos</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(rol => (
                  <TableRow key={rol.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Key className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{rol.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {rol.descripcion || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{rol.permisos_count} permisos</Badge>
                    </TableCell>
                    <TableCell>{rol.seg_empresas?.nombre || 'Global'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditModal(rol)}>
                            <Edit className="mr-2 h-4 w-4" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setRolToDelete(rol);
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

      <RolModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        rol={editingRol}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar rol?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente el rol "{rolToDelete?.nombre}".
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

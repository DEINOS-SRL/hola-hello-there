import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, AppWindow, MoreHorizontal, Edit, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
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
import { AplicacionModal } from '@/components/modals/AplicacionModal';

export default function Aplicaciones() {
  const [searchTerm, setSearchTerm] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingApp, setEditingApp] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [appToDelete, setAppToDelete] = useState<any>(null);
  const { toast } = useToast();

  const { data: aplicaciones, isLoading, error, refetch } = useQuery({
    queryKey: ['aplicaciones'],
    queryFn: async () => {
      const { data, error } = await segClient
        .from('aplicaciones')
        .select('*')
        .order('nombre', { ascending: true });
      if (error) throw error;
      return data;
    },
  });

  const toggleAppStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await segClient
      .from('aplicaciones')
      .update({ activa: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: `Aplicación ${!currentStatus ? 'activada' : 'desactivada'}` });
      refetch();
    }
  };

  const confirmDelete = async () => {
    if (!appToDelete) return;
    
    const { error } = await segClient
      .from('aplicaciones')
      .delete()
      .eq('id', appToDelete.id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la aplicación', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Aplicación eliminada' });
      refetch();
    }
    setDeleteDialogOpen(false);
    setAppToDelete(null);
  };

  const openEditModal = (app: any) => {
    setEditingApp(app);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingApp(null);
    setModalOpen(true);
  };

  const filtered = aplicaciones?.filter((a: any) => 
    a.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.descripcion?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar aplicaciones</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Aplicaciones</h1>
          <p className="text-muted-foreground">Gestiona los módulos de la plataforma</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Nueva Aplicación
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar aplicaciones..." 
                className="pl-10"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="outline">{filtered.length} aplicaciones</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No se encontraron aplicaciones</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Aplicación</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((app: any) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <AppWindow className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{app.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[300px] truncate">
                      {app.descripcion || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={app.activa ? 'default' : 'secondary'}>
                        {app.activa ? 'Activa' : 'Inactiva'}
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
                          <DropdownMenuItem onClick={() => openEditModal(app)}>
                            <Edit className="mr-2 h-4 w-4" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleAppStatus(app.id, app.activa || false)}>
                            {app.activa ? (
                              <><ToggleLeft className="mr-2 h-4 w-4" />Desactivar</>
                            ) : (
                              <><ToggleRight className="mr-2 h-4 w-4" />Activar</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setAppToDelete(app);
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

      <AplicacionModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        aplicacion={editingApp}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar aplicación?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la aplicación "{appToDelete?.nombre}".
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

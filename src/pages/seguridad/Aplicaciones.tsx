import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, AppWindow, MoreHorizontal, Edit, Trash2, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function Aplicaciones() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: aplicaciones, isLoading, error, refetch } = useQuery({
    queryKey: ['aplicaciones'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seg_aplicaciones')
        .select('*')
        .order('nombre', { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const toggleAppStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await supabase
      .from('seg_aplicaciones')
      .update({ activa: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: `Aplicación ${!currentStatus ? 'activada' : 'desactivada'}` });
      refetch();
    }
  };

  const deleteApp = async (id: string) => {
    const { error } = await supabase
      .from('seg_aplicaciones')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la aplicación', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Aplicación eliminada' });
      refetch();
    }
  };

  const filtered = aplicaciones?.filter(a => 
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
        <Button><Plus className="mr-2 h-4 w-4" />Nueva Aplicación</Button>
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
                {filtered.map(app => (
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
                          <DropdownMenuItem>
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
                            onClick={() => deleteApp(app.id)}
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
    </div>
  );
}

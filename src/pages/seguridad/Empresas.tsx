import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, Building2, MoreHorizontal, Edit, Trash2, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

export default function Empresas() {
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const { data: empresas, isLoading, error, refetch } = useQuery({
    queryKey: ['empresas'],
    queryFn: async () => {
      // Get empresas with user count
      const { data: empresasData, error: empresasError } = await supabase
        .from('seg_empresas')
        .select('*')
        .order('nombre', { ascending: true });

      if (empresasError) throw empresasError;

      // Get user counts per empresa
      const { data: userCounts, error: countError } = await supabase
        .from('seg_usuarios')
        .select('empresa_id')
        .eq('activo', true);

      if (countError) throw countError;

      // Count users per empresa
      const counts: Record<string, number> = {};
      userCounts?.forEach(u => {
        if (u.empresa_id) {
          counts[u.empresa_id] = (counts[u.empresa_id] || 0) + 1;
        }
      });

      return empresasData?.map(e => ({
        ...e,
        usuarios_count: counts[e.id] || 0
      }));
    },
  });

  const deleteEmpresa = async (id: string) => {
    const { error } = await supabase
      .from('seg_empresas')
      .delete()
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar la empresa', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Empresa eliminada' });
      refetch();
    }
  };

  const filtered = empresas?.filter(e => 
    e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.direccion?.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar empresas</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Empresas</h1>
          <p className="text-muted-foreground">Gestiona las empresas de la plataforma</p>
        </div>
        <Button><Plus className="mr-2 h-4 w-4" />Nueva Empresa</Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar empresas..." 
                className="pl-10" 
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <Badge variant="outline">{filtered.length} empresas</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No se encontraron empresas</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Dirección</TableHead>
                  <TableHead>Usuarios</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map(empresa => (
                  <TableRow key={empresa.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Building2 className="h-4 w-4 text-primary" />
                        </div>
                        <span className="font-medium">{empresa.nombre}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{empresa.direccion || '-'}</TableCell>
                    <TableCell>
                      <Badge variant="secondary">{empresa.usuarios_count}</Badge>
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
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => deleteEmpresa(empresa.id)}
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

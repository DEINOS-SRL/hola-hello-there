import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Plus, Search, MoreHorizontal, UserCheck, UserX, Edit, Trash2, Loader2, Shield, X, Filter } from 'lucide-react';
import { segClient } from '@/modules/security/services/segClient';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import { useToast } from '@/hooks/use-toast';
import { UsuarioModal } from '@/components/modals/UsuarioModal';
import { AsignarRolesModal } from '@/components/modals/AsignarRolesModal';

export default function Usuarios() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRolFilter, setSelectedRolFilter] = useState<string>('all');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<any>(null);
  const [rolesModalOpen, setRolesModalOpen] = useState(false);
  const [userForRoles, setUserForRoles] = useState<any>(null);
  const { toast } = useToast();

  const { data: usuarios, isLoading, error, refetch } = useQuery({
    queryKey: ['usuarios-con-roles'],
    queryFn: async () => {
      // Obtener usuarios con empresa
      const { data: usersData, error: usersError } = await segClient
        .from('usuarios')
        .select(`*, empresas(nombre)`)
        .order('nombre', { ascending: true });
      if (usersError) throw usersError;

      // Obtener roles de todos los usuarios
      const { data: rolesData, error: rolesError } = await segClient
        .from('usuario_rol')
        .select(`
          usuario_id,
          roles(nombre),
          modulos(nombre)
        `);
      if (rolesError) throw rolesError;

      // Agrupar roles por usuario
      const rolesByUser = (rolesData || []).reduce((acc: Record<string, any[]>, ur: any) => {
        const userId = ur.usuario_id;
        if (!acc[userId]) acc[userId] = [];
        acc[userId].push({
          rol: ur.roles?.nombre,
          modulo: ur.modulos?.nombre,
        });
        return acc;
      }, {});

      // Combinar usuarios con sus roles
      return usersData?.map((user: any) => ({
        ...user,
        roles: rolesByUser[user.id] || [],
      })) || [];
    },
  });

  const toggleUserStatus = async (id: string, currentStatus: boolean) => {
    const { error } = await segClient
      .from('usuarios')
      .update({ activo: !currentStatus })
      .eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo actualizar el estado', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: `Usuario ${!currentStatus ? 'activado' : 'desactivado'}` });
      refetch();
    }
  };

  const confirmDelete = async () => {
    if (!userToDelete) return;
    
    const { error } = await segClient
      .from('usuarios')
      .delete()
      .eq('id', userToDelete.id);

    if (error) {
      toast({ title: 'Error', description: 'No se pudo eliminar el usuario', variant: 'destructive' });
    } else {
      toast({ title: 'Éxito', description: 'Usuario eliminado' });
      refetch();
    }
    setDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const openEditModal = (user: any) => {
    setEditingUser(user);
    setModalOpen(true);
  };

  const openCreateModal = () => {
    setEditingUser(null);
    setModalOpen(true);
  };

  const openRolesModal = (user: any) => {
    setUserForRoles(user);
    setRolesModalOpen(true);
  };

  // Obtener lista única de roles para el filtro
  const availableRoles = usuarios
    ? [...new Set(usuarios.flatMap((u: any) => u.roles?.map((r: any) => r.rol) || []))]
        .filter(Boolean)
        .sort()
    : [];

  // Filtrado por búsqueda y rol
  const filtered = usuarios?.filter((u: any) => {
    const matchesSearch = 
      u.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = 
      selectedRolFilter === 'all' ||
      (selectedRolFilter === 'sin-rol' && (!u.roles || u.roles.length === 0)) ||
      (u.roles?.some((r: any) => r.rol === selectedRolFilter));
    
    return matchesSearch && matchesRole;
  }) || [];

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-destructive">Error al cargar usuarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-muted-foreground">Gestiona los usuarios del sistema</p>
        </div>
        <Button onClick={openCreateModal}>
          <Plus className="mr-2 h-4 w-4" />Nuevo Usuario
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Buscar usuarios..." 
                className="pl-10" 
                value={searchTerm} 
                onChange={e => setSearchTerm(e.target.value)} 
              />
            </div>
            
            {/* Filtro por rol */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={selectedRolFilter} onValueChange={setSelectedRolFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por rol" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos los roles</SelectItem>
                  <SelectItem value="sin-rol">Sin rol asignado</SelectItem>
                  {availableRoles.map((rol: string) => (
                    <SelectItem key={rol} value={rol}>{rol}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedRolFilter !== 'all' && (
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => setSelectedRolFilter('all')}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>

            <Badge variant="outline">{filtered.length} usuarios</Badge>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
              <p>No se encontraron usuarios</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuario</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Roles</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((user: any) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs">
                            {user.nombre?.[0] || '?'}{user.apellido?.[0] || '?'}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium">{user.nombre} {user.apellido}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground">{user.email}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {user.roles && user.roles.length > 0 ? (
                          user.roles.map((r: any, idx: number) => (
                            <Badge 
                              key={idx} 
                              variant="outline" 
                              className="text-xs bg-primary/5 border-primary/20"
                              title={`Módulo: ${r.modulo}`}
                            >
                              {r.rol}
                            </Badge>
                          ))
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Sin roles</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>{user.empresas?.nombre || '-'}</TableCell>
                    <TableCell>
                      <Badge variant={user.activo ? 'default' : 'secondary'}>
                        {user.activo ? 'Activo' : 'Inactivo'}
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
                          <DropdownMenuItem onClick={() => openEditModal(user)}>
                            <Edit className="mr-2 h-4 w-4" />Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openRolesModal(user)}>
                            <Shield className="mr-2 h-4 w-4" />Asignar Roles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => toggleUserStatus(user.id, user.activo || false)}>
                            {user.activo ? (
                              <><UserX className="mr-2 h-4 w-4" />Desactivar</>
                            ) : (
                              <><UserCheck className="mr-2 h-4 w-4" />Activar</>
                            )}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            className="text-destructive"
                            onClick={() => {
                              setUserToDelete(user);
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

      <UsuarioModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        usuario={editingUser}
        onSuccess={refetch}
      />

      <AsignarRolesModal
        open={rolesModalOpen}
        onOpenChange={setRolesModalOpen}
        usuario={userForRoles}
        onSuccess={refetch}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente a {userToDelete?.nombre} {userToDelete?.apellido}.
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

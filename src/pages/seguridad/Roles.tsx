import { Plus, Search, Key, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockRoles = [
  { id: '1', nombre: 'Administrador', descripcion: 'Acceso completo al sistema', permisos: 12, empresa: 'Global' },
  { id: '2', nombre: 'Usuario', descripcion: 'Acceso básico', permisos: 4, empresa: 'DNSCloud Corp' },
];

export default function Roles() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Roles</h1><p className="text-muted-foreground">Gestiona los roles y permisos</p></div>
        <Button><Plus className="mr-2 h-4 w-4" />Nuevo Rol</Button>
      </div>
      <Card>
        <CardHeader className="pb-3"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar roles..." className="pl-10" /></div></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Rol</TableHead><TableHead>Descripción</TableHead><TableHead>Permisos</TableHead><TableHead>Empresa</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
            <TableBody>
              {mockRoles.map(r => (
                <TableRow key={r.id}>
                  <TableCell><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Key className="h-4 w-4 text-primary" /></div><span className="font-medium">{r.nombre}</span></div></TableCell>
                  <TableCell className="text-muted-foreground">{r.descripcion}</TableCell>
                  <TableCell><Badge variant="secondary">{r.permisos} permisos</Badge></TableCell>
                  <TableCell>{r.empresa}</TableCell>
                  <TableCell><DropdownMenu><DropdownMenuTrigger asChild><Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger><DropdownMenuContent align="end"><DropdownMenuItem><Edit className="mr-2 h-4 w-4" />Editar</DropdownMenuItem><DropdownMenuItem className="text-destructive"><Trash2 className="mr-2 h-4 w-4" />Eliminar</DropdownMenuItem></DropdownMenuContent></DropdownMenu></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { Plus, Search, Building2, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockEmpresas = [
  { id: '1', nombre: 'DNSCloud Corp', direccion: 'Av. Tecnología 456', usuarios: 15 },
  { id: '2', nombre: 'Empresa 2', direccion: 'Calle Principal 123', usuarios: 8 },
];

export default function Empresas() {
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
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar empresas..." className="pl-10" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Empresa</TableHead><TableHead>Dirección</TableHead><TableHead>Usuarios</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
            <TableBody>
              {mockEmpresas.map(e => (
                <TableRow key={e.id}>
                  <TableCell><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><Building2 className="h-4 w-4 text-primary" /></div><span className="font-medium">{e.nombre}</span></div></TableCell>
                  <TableCell className="text-muted-foreground">{e.direccion}</TableCell>
                  <TableCell>{e.usuarios}</TableCell>
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

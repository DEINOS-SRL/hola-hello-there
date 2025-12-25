import { Plus, Search, AppWindow, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const mockApps = [
  { id: '1', nombre: 'Seguridad', descripcion: 'Módulo de seguridad', activa: true },
  { id: '2', nombre: 'Reportes', descripcion: 'Generación de reportes', activa: true },
  { id: '3', nombre: 'Calendario', descripcion: 'Gestión de eventos', activa: false },
];

export default function Aplicaciones() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div><h1 className="text-2xl font-bold">Aplicaciones</h1><p className="text-muted-foreground">Gestiona los módulos de la plataforma</p></div>
        <Button><Plus className="mr-2 h-4 w-4" />Nueva Aplicación</Button>
      </div>
      <Card>
        <CardHeader className="pb-3"><div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Buscar aplicaciones..." className="pl-10" /></div></CardHeader>
        <CardContent>
          <Table>
            <TableHeader><TableRow><TableHead>Aplicación</TableHead><TableHead>Descripción</TableHead><TableHead>Estado</TableHead><TableHead className="w-[50px]"></TableHead></TableRow></TableHeader>
            <TableBody>
              {mockApps.map(a => (
                <TableRow key={a.id}>
                  <TableCell><div className="flex items-center gap-3"><div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center"><AppWindow className="h-4 w-4 text-primary" /></div><span className="font-medium">{a.nombre}</span></div></TableCell>
                  <TableCell className="text-muted-foreground">{a.descripcion}</TableCell>
                  <TableCell><Badge variant={a.activa ? 'default' : 'secondary'}>{a.activa ? 'Activa' : 'Inactiva'}</Badge></TableCell>
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

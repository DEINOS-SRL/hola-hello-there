import { useState } from 'react';
import { Award, Plus, Search, User, Calendar, FileText } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// Datos de ejemplo
const certificacionesDemo = [
  { id: '1', empleado: 'Juan Pérez', tipo: 'Licencia de Conducir C', categoria: 'Conducción', fechaEmision: '2024-01-15', fechaVencimiento: '2026-01-15', estado: 'vigente' },
  { id: '2', empleado: 'María García', tipo: 'Curso de Seguridad Industrial', categoria: 'Seguridad', fechaEmision: '2024-06-01', fechaVencimiento: '2025-06-01', estado: 'vigente' },
  { id: '3', empleado: 'Carlos López', tipo: 'Operador de Grúa', categoria: 'Operación', fechaEmision: '2023-03-20', fechaVencimiento: '2025-01-10', estado: 'por_vencer' },
  { id: '4', empleado: 'Ana Martínez', tipo: 'Primeros Auxilios', categoria: 'Seguridad', fechaEmision: '2023-01-01', fechaVencimiento: '2024-12-01', estado: 'vencido' },
];

const estadoColors: Record<string, string> = {
  vigente: 'bg-green-500/10 text-green-600 border-green-200',
  por_vencer: 'bg-amber-500/10 text-amber-600 border-amber-200',
  vencido: 'bg-red-500/10 text-red-600 border-red-200',
};

const estadoLabels: Record<string, string> = {
  vigente: 'Vigente',
  por_vencer: 'Por Vencer',
  vencido: 'Vencido',
};

export default function Certificaciones() {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCerts = certificacionesDemo.filter(
    (c) =>
      c.empleado.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/10">
            <Award className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Certificaciones</h1>
            <p className="text-muted-foreground text-sm">
              {filteredCerts.length} certificaciones registradas
            </p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nueva Certificación
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por empleado o tipo..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Empleado</TableHead>
                <TableHead>Certificación</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCerts.map((cert) => (
                <TableRow key={cert.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{cert.empleado}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      {cert.tipo}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{cert.categoria}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(cert.fechaEmision).toLocaleDateString('es-AR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(cert.fechaVencimiento).toLocaleDateString('es-AR')}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={estadoColors[cert.estado]}>
                      {estadoLabels[cert.estado]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}

import { useState } from 'react';
import { 
  FileCheck, 
  Plus, 
  Search, 
  Filter,
  FolderTree,
  FileText,
  Shield,
  Leaf,
  HardHat,
  ChevronRight,
  Download,
  Eye
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

// Categorías del SGI
const categoriasSGI = [
  {
    id: 'calidad',
    nombre: 'Gestión de Calidad',
    icon: FileCheck,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    norma: 'ISO 9001:2015',
    descripcion: 'Sistema de gestión de calidad',
  },
  {
    id: 'ambiente',
    nombre: 'Gestión Ambiental',
    icon: Leaf,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    norma: 'ISO 14001:2015',
    descripcion: 'Sistema de gestión ambiental',
  },
  {
    id: 'seguridad',
    nombre: 'Seguridad y Salud',
    icon: HardHat,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    norma: 'ISO 45001:2018',
    descripcion: 'Sistema de gestión de seguridad y salud en el trabajo',
  },
  {
    id: 'seguridad-info',
    nombre: 'Seguridad de la Información',
    icon: Shield,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    norma: 'ISO 27001:2022',
    descripcion: 'Sistema de gestión de seguridad de la información',
  },
];

// Documentos de ejemplo
const documentosEjemplo = [
  {
    id: '1',
    titulo: 'Manual del Sistema de Gestión Integrado',
    codigo: 'SGI-MAN-001',
    categoria: 'calidad',
    version: '3.0',
    estado: 'vigente',
    fechaActualizacion: '2024-01-15',
  },
  {
    id: '2',
    titulo: 'Política de Calidad, Ambiente y Seguridad',
    codigo: 'SGI-POL-001',
    categoria: 'calidad',
    version: '2.1',
    estado: 'vigente',
    fechaActualizacion: '2024-02-20',
  },
  {
    id: '3',
    titulo: 'Procedimiento de Control de Documentos',
    codigo: 'SGI-PRO-001',
    categoria: 'calidad',
    version: '4.0',
    estado: 'vigente',
    fechaActualizacion: '2024-03-10',
  },
  {
    id: '4',
    titulo: 'Matriz de Aspectos e Impactos Ambientales',
    codigo: 'SGA-MAT-001',
    categoria: 'ambiente',
    version: '2.0',
    estado: 'vigente',
    fechaActualizacion: '2024-01-25',
  },
  {
    id: '5',
    titulo: 'Procedimiento de Gestión de Residuos',
    codigo: 'SGA-PRO-002',
    categoria: 'ambiente',
    version: '1.5',
    estado: 'en_revision',
    fechaActualizacion: '2024-04-05',
  },
  {
    id: '6',
    titulo: 'Matriz IPERC',
    codigo: 'SST-MAT-001',
    categoria: 'seguridad',
    version: '3.2',
    estado: 'vigente',
    fechaActualizacion: '2024-02-28',
  },
  {
    id: '7',
    titulo: 'Plan de Respuesta a Emergencias',
    codigo: 'SST-PLA-001',
    categoria: 'seguridad',
    version: '2.0',
    estado: 'vigente',
    fechaActualizacion: '2024-03-15',
  },
];

const estadoConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  vigente: { label: 'Vigente', variant: 'default' },
  en_revision: { label: 'En Revisión', variant: 'secondary' },
  obsoleto: { label: 'Obsoleto', variant: 'outline' },
};

export default function SGIPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<string | null>(null);

  const documentosFiltrados = documentosEjemplo.filter(doc => {
    const matchSearch = doc.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
                       doc.codigo.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategoria = !selectedCategoria || doc.categoria === selectedCategoria;
    return matchSearch && matchCategoria;
  });

  const getCategoria = (id: string) => categoriasSGI.find(c => c.id === id);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <FileCheck className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Sistema de Gestión Integrado</h1>
            <p className="text-muted-foreground">Normas, procedimientos y políticas de la organización</p>
          </div>
        </div>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Documento
        </Button>
      </div>

      {/* Categorías */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {categoriasSGI.map((categoria) => {
          const Icon = categoria.icon;
          const docsCount = documentosEjemplo.filter(d => d.categoria === categoria.id).length;
          const isSelected = selectedCategoria === categoria.id;
          
          return (
            <Card 
              key={categoria.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-primary border-primary' : ''
              }`}
              onClick={() => setSelectedCategoria(isSelected ? null : categoria.id)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${categoria.bgColor} ${categoria.color}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {docsCount} docs
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <h3 className="font-semibold text-sm">{categoria.nombre}</h3>
                <p className="text-xs text-muted-foreground mt-1">{categoria.norma}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Búsqueda y filtros */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por título o código..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="outline">
          <Filter className="h-4 w-4 mr-2" />
          Filtros
        </Button>
      </div>

      {/* Lista de documentos */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FolderTree className="h-5 w-5" />
                Documentos del SGI
              </CardTitle>
              <CardDescription>
                {documentosFiltrados.length} documentos encontrados
                {selectedCategoria && ` en ${getCategoria(selectedCategoria)?.nombre}`}
              </CardDescription>
            </div>
            {selectedCategoria && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedCategoria(null)}>
                Limpiar filtro
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {documentosFiltrados.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No se encontraron documentos</p>
            </div>
          ) : (
            <div className="space-y-2">
              {documentosFiltrados.map((doc) => {
                const categoria = getCategoria(doc.categoria);
                const Icon = categoria?.icon || FileText;
                
                return (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors group"
                  >
                    <div className="flex items-center gap-4">
                      <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${categoria?.bgColor} ${categoria?.color}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{doc.titulo}</span>
                          <Badge variant={estadoConfig[doc.estado].variant} className="text-xs">
                            {estadoConfig[doc.estado].label}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-1">
                          <span className="font-mono">{doc.codigo}</span>
                          <span>•</span>
                          <span>v{doc.version}</span>
                          <span>•</span>
                          <span>Actualizado: {doc.fechaActualizacion}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

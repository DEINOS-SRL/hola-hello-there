import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FileCheck, 
  Shield, 
  Leaf, 
  HardHat, 
  FileText, 
  Download, 
  Eye,
  Plus,
  Filter
} from 'lucide-react';

const categories = [
  { id: 'calidad', label: 'Calidad', icon: FileCheck, color: 'bg-blue-500', norm: 'ISO 9001' },
  { id: 'ambiente', label: 'Medio Ambiente', icon: Leaf, color: 'bg-green-500', norm: 'ISO 14001' },
  { id: 'seguridad', label: 'Seguridad', icon: HardHat, color: 'bg-amber-500', norm: 'ISO 45001' },
];

const documents = [
  { 
    id: 1, 
    title: 'Manual del Sistema de Gestión Integrada', 
    code: 'SGI-MAN-001', 
    version: '3.0',
    category: 'calidad',
    type: 'Manual',
    status: 'Vigente',
    lastUpdate: '2024-12-01'
  },
  { 
    id: 2, 
    title: 'Procedimiento de Control de Documentos', 
    code: 'SGI-PRO-001', 
    version: '2.1',
    category: 'calidad',
    type: 'Procedimiento',
    status: 'Vigente',
    lastUpdate: '2024-11-15'
  },
  { 
    id: 3, 
    title: 'Plan de Gestión Ambiental', 
    code: 'SGI-PLA-002', 
    version: '1.5',
    category: 'ambiente',
    type: 'Plan',
    status: 'Vigente',
    lastUpdate: '2024-10-20'
  },
  { 
    id: 4, 
    title: 'Matriz de Identificación de Peligros', 
    code: 'SGI-MAT-001', 
    version: '4.0',
    category: 'seguridad',
    type: 'Matriz',
    status: 'Vigente',
    lastUpdate: '2024-12-10'
  },
  { 
    id: 5, 
    title: 'Instructivo de Manejo de Residuos', 
    code: 'SGI-INS-003', 
    version: '2.0',
    category: 'ambiente',
    type: 'Instructivo',
    status: 'En revisión',
    lastUpdate: '2024-12-18'
  },
  { 
    id: 6, 
    title: 'Procedimiento de Auditorías Internas', 
    code: 'SGI-PRO-005', 
    version: '3.2',
    category: 'calidad',
    type: 'Procedimiento',
    status: 'Vigente',
    lastUpdate: '2024-09-30'
  },
];

export default function SGIPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Sistema de Gestión Integrada</h1>
          <p className="text-muted-foreground">Documentación del SGI - ISO 9001, ISO 14001, ISO 45001</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Documento
          </Button>
        </div>
      </div>

      {/* Category Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {categories.map((cat) => (
          <Card key={cat.id} className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="pt-6">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${cat.color}/10`}>
                  <cat.icon className={`h-6 w-6 ${cat.color.replace('bg-', 'text-')}`} />
                </div>
                <div>
                  <p className="font-semibold">{cat.label}</p>
                  <p className="text-sm text-muted-foreground">{cat.norm}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Documents Tabs */}
      <Tabs defaultValue="todos" className="w-full">
        <TabsList>
          <TabsTrigger value="todos">Todos</TabsTrigger>
          <TabsTrigger value="manuales">Manuales</TabsTrigger>
          <TabsTrigger value="procedimientos">Procedimientos</TabsTrigger>
          <TabsTrigger value="instructivos">Instructivos</TabsTrigger>
          <TabsTrigger value="registros">Registros</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Documentos del SGI</CardTitle>
              <CardDescription>Lista completa de documentos del Sistema de Gestión Integrada</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {documents.map((doc) => {
                  const category = categories.find(c => c.id === doc.category);
                  return (
                    <div 
                      key={doc.id} 
                      className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className={`p-2 rounded-lg ${category?.color}/10`}>
                          <FileText className={`h-5 w-5 ${category?.color.replace('bg-', 'text-')}`} />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-sm">{doc.title}</p>
                            <Badge variant={doc.status === 'Vigente' ? 'default' : 'secondary'} className="text-xs">
                              {doc.status}
                            </Badge>
                          </div>
                          <div className="flex items-center gap-3 mt-1">
                            <span className="text-xs text-muted-foreground font-mono">{doc.code}</span>
                            <span className="text-xs text-muted-foreground">v{doc.version}</span>
                            <span className="text-xs text-muted-foreground">{doc.type}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground hidden sm:block">{doc.lastUpdate}</span>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manuales" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Filtrado por Manuales - {documents.filter(d => d.type === 'Manual').length} documentos
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procedimientos" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Filtrado por Procedimientos - {documents.filter(d => d.type === 'Procedimiento').length} documentos
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="instructivos" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Filtrado por Instructivos - {documents.filter(d => d.type === 'Instructivo').length} documentos
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="registros" className="mt-4">
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground text-center py-8">
                Filtrado por Registros - 0 documentos
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

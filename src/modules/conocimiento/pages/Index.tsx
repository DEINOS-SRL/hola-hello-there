import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, FileCheck, FileText, FolderOpen, Search, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const stats = [
  { label: 'Documentos', value: '156', icon: FileText, color: 'text-blue-500' },
  { label: 'Categorías', value: '12', icon: FolderOpen, color: 'text-amber-500' },
  { label: 'SGI Activos', value: '34', icon: FileCheck, color: 'text-emerald-500' },
];

const recentDocs = [
  { id: 1, title: 'Manual de Procedimientos Operativos', category: 'Procedimientos', date: '2024-12-20' },
  { id: 2, title: 'Política de Seguridad Industrial', category: 'Políticas', date: '2024-12-18' },
  { id: 3, title: 'Guía de Mantenimiento Preventivo', category: 'Guías', date: '2024-12-15' },
  { id: 4, title: 'Normativa Ambiental Actualizada', category: 'Normativas', date: '2024-12-12' },
];

export default function ConocimientoIndex() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Base de Conocimiento</h1>
          <p className="text-muted-foreground">Gestión centralizada del conocimiento corporativo</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Search className="h-4 w-4 mr-2" />
            Buscar
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Documento
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.label} className="hover:shadow-md transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
                <stat.icon className={`h-10 w-10 ${stat.color} opacity-80`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Access */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* SGI Module Card */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all hover:border-primary/50 group"
          onClick={() => navigate('/conocimiento/sgi')}
        >
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-900/50 transition-colors">
                <FileCheck className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Sistema de Gestión Integrada</CardTitle>
                <CardDescription>ISO 9001, ISO 14001, ISO 45001</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Accede a los documentos del SGI: políticas, procedimientos, instructivos y registros 
              de calidad, medio ambiente y seguridad.
            </p>
            <Button variant="link" className="px-0 mt-2">
              Ir al SGI →
            </Button>
          </CardContent>
        </Card>

        {/* General Knowledge Card */}
        <Card className="hover:shadow-lg transition-all">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                <BookOpen className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-lg">Documentación General</CardTitle>
                <CardDescription>Manuales, guías y procedimientos</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Biblioteca de documentos corporativos: manuales operativos, guías técnicas, 
              procedimientos administrativos y más.
            </p>
            <Button variant="link" className="px-0 mt-2">
              Explorar documentos →
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent Documents */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Documentos Recientes</CardTitle>
          <CardDescription>Últimos documentos actualizados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentDocs.map((doc) => (
              <div 
                key={doc.id} 
                className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{doc.title}</p>
                    <p className="text-xs text-muted-foreground">{doc.category}</p>
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">{doc.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

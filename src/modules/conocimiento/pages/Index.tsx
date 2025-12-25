import { Link } from 'react-router-dom';
import { BookOpen, FileCheck, FileText, FolderOpen, Search, BookMarked } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface SubmoduloCard {
  title: string;
  description: string;
  icon: React.ReactNode;
  path: string;
  badge?: string;
  available: boolean;
}

const submodulos: SubmoduloCard[] = [
  {
    title: 'SGI',
    description: 'Sistema de Gestión Integrado - Normas, procedimientos y políticas',
    icon: <FileCheck className="h-6 w-6" />,
    path: '/conocimiento/sgi',
    available: true,
  },
  {
    title: 'Documentos',
    description: 'Repositorio central de documentos de la organización',
    icon: <FolderOpen className="h-6 w-6" />,
    path: '/conocimiento/documentos',
    badge: 'Próximamente',
    available: false,
  },
  {
    title: 'Manuales',
    description: 'Manuales de operación y guías de usuario',
    icon: <BookMarked className="h-6 w-6" />,
    path: '/conocimiento/manuales',
    badge: 'Próximamente',
    available: false,
  },
  {
    title: 'Procedimientos',
    description: 'Procedimientos operativos estándar (POE/SOP)',
    icon: <FileText className="h-6 w-6" />,
    path: '/conocimiento/procedimientos',
    badge: 'Próximamente',
    available: false,
  },
];

export default function ConocimientoIndex() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookOpen className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Base de Conocimiento</h1>
          <p className="text-muted-foreground">
            Gestión de documentación y conocimiento organizacional
          </p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          placeholder="Buscar en la base de conocimiento..."
          className="w-full pl-10 pr-4 py-3 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {submodulos.map((submodulo) => (
          <Card 
            key={submodulo.title}
            className={`group transition-all duration-200 ${
              submodulo.available 
                ? 'hover:shadow-md hover:border-primary/50 cursor-pointer' 
                : 'opacity-60'
            }`}
          >
            {submodulo.available ? (
              <Link to={submodulo.path} className="block h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                      {submodulo.icon}
                    </div>
                    {submodulo.badge && (
                      <Badge variant="secondary" className="text-xs">
                        {submodulo.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3">{submodulo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{submodulo.description}</CardDescription>
                </CardContent>
              </Link>
            ) : (
              <>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-lg flex items-center justify-center bg-muted text-muted-foreground">
                      {submodulo.icon}
                    </div>
                    {submodulo.badge && (
                      <Badge variant="outline" className="text-xs">
                        {submodulo.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg mt-3 text-muted-foreground">{submodulo.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription>{submodulo.description}</CardDescription>
                </CardContent>
              </>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

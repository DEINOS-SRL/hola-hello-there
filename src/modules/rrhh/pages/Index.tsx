import { Link } from 'react-router-dom';
import { Users, UserCheck, UserPlus, Clock, FileText, Award } from 'lucide-react';
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
    title: 'Empleados',
    description: 'Gestión de datos personales, contacto y documentación de empleados',
    icon: <UserCheck className="h-6 w-6" />,
    path: '/rrhh/empleados',
    available: true,
  },
  {
    title: 'Reclutamiento',
    description: 'Proceso de selección, entrevistas y contratación',
    icon: <UserPlus className="h-6 w-6" />,
    path: '/rrhh/reclutamiento',
    badge: 'Próximamente',
    available: false,
  },
  {
    title: 'Asistencia',
    description: 'Control de horarios, asistencia y permisos',
    icon: <Clock className="h-6 w-6" />,
    path: '/rrhh/asistencia',
    badge: 'Próximamente',
    available: false,
  },
  {
    title: 'Nómina',
    description: 'Gestión de sueldos, deducciones y pagos',
    icon: <FileText className="h-6 w-6" />,
    path: '/rrhh/nomina',
    badge: 'Próximamente',
    available: false,
  },
  {
    title: 'Capacitación',
    description: 'Programas de formación y desarrollo profesional',
    icon: <Award className="h-6 w-6" />,
    path: '/rrhh/capacitacion',
    badge: 'Próximamente',
    available: false,
  },
];

export default function RRHHIndex() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Recursos Humanos</h1>
          <p className="text-muted-foreground">
            Gestiona el capital humano de tu organización
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <div className={`h-10 w-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors`}>
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

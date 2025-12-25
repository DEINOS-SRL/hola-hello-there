import { Briefcase, FileSpreadsheet, FileCheck2, Activity } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const submodulos = [
  {
    title: 'Presupuestos',
    description: 'Gestión de presupuestos y cotizaciones comerciales',
    icon: FileSpreadsheet,
    href: '/comercial/presupuestos',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'Certificaciones',
    description: 'Control de certificaciones comerciales',
    icon: FileCheck2,
    href: '/comercial/certificaciones',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Seguimientos',
    description: 'Seguimiento de operaciones y clientes',
    icon: Activity,
    href: '/comercial/seguimientos',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
];

export default function ComercialIndex() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-lg bg-primary/10">
          <Briefcase className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Comercial</h1>
          <p className="text-muted-foreground">
            Gestión comercial: presupuestos, certificaciones y seguimientos
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {submodulos.map((modulo) => (
          <Link key={modulo.href} to={modulo.href}>
            <Card className="h-full hover:shadow-md transition-all duration-200 hover:border-primary/30 cursor-pointer group">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${modulo.bgColor} group-hover:scale-110 transition-transform`}>
                    <modulo.icon className={`h-5 w-5 ${modulo.color}`} />
                  </div>
                  <CardTitle className="text-lg group-hover:text-primary transition-colors">
                    {modulo.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription>{modulo.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}

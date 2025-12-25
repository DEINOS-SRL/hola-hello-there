import { Building2, MapPin, Globe, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { Separator } from '@/components/ui/separator';

export default function ConfiguracionEmpresa() {
  const { empresa } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="p-3 rounded-lg bg-primary/10">
          <Building2 className="h-8 w-8 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Empresa Actual</h1>
          <p className="text-muted-foreground">
            Información de la empresa en la que estás trabajando
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Datos principales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-primary" />
              Datos de la empresa
            </CardTitle>
            <CardDescription>Información general de la organización</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Nombre</p>
              <p className="font-medium">{empresa?.nombre || 'Sin nombre'}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Dirección</p>
              <p className="font-medium">{empresa?.direccion || 'No especificada'}</p>
            </div>
            <Separator />
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">Horarios</p>
              <p className="font-medium">{empresa?.horarios || 'No especificados'}</p>
            </div>
          </CardContent>
        </Card>

        {/* Información adicional */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5 text-primary" />
              Información adicional
            </CardTitle>
            <CardDescription>Otros datos de la empresa</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Ubicación</p>
                <p className="font-medium">{empresa?.direccion || 'No especificada'}</p>
              </div>
            </div>
            <Separator />
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground">Registrada desde</p>
                <p className="font-medium">
                  {empresa?.created_at 
                    ? new Date(empresa.created_at).toLocaleDateString('es-AR', { 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                      })
                    : 'No disponible'
                  }
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info adicional */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-primary" />
            Información adicional
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Para modificar los datos de la empresa, contacta al administrador del sistema o 
            accede a la sección de <span className="text-primary font-medium">Administración → Empresas</span>.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

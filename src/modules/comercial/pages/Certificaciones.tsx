import { FileCheck2, Plus, Search, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function CertificacionesComerciales() {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-green-100">
            <FileCheck2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Certificaciones</h1>
            <p className="text-muted-foreground">
              Gestión de certificaciones comerciales
            </p>
          </div>
        </div>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nueva Certificación
        </Button>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Buscar certificaciones..." className="pl-9" />
        </div>
        <Button variant="outline" className="gap-2">
          <Filter className="h-4 w-4" />
          Filtros
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Certificaciones</CardTitle>
          <CardDescription>
            Aquí aparecerán las certificaciones cuando se implementen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="p-4 rounded-full bg-muted mb-4">
              <FileCheck2 className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium mb-2">Sin certificaciones</h3>
            <p className="text-muted-foreground max-w-sm">
              Crea tu primera certificación haciendo clic en "Nueva Certificación"
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

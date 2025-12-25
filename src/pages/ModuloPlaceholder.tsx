import { useLocation } from 'react-router-dom';
import { Construction, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Link } from 'react-router-dom';

export default function ModuloPlaceholder() {
  const location = useLocation();
  const moduleName = location.pathname.split('/').filter(Boolean).pop() || 'Módulo';
  const formattedName = moduleName.charAt(0).toUpperCase() + moduleName.slice(1).replace(/-/g, ' ');

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
            <Construction className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-2xl">{formattedName}</CardTitle>
          <CardDescription>
            Este módulo está en desarrollo
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <p className="text-muted-foreground">
            La página para este módulo aún no ha sido implementada. 
            Pronto estará disponible con todas sus funcionalidades.
          </p>
          <Button asChild variant="outline">
            <Link to="/dashboard">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Volver al Dashboard
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

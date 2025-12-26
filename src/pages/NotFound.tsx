import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";
import notFoundWorker from "@/assets/not-found-worker.png";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-background to-muted/30 p-6">
      <div className="text-center max-w-lg">
        {/* Imagen del trabajador */}
        <div className="mb-6 flex justify-center">
          <img 
            src={notFoundWorker} 
            alt="Trabajador con pala" 
            className="w-64 h-auto rounded-lg shadow-lg"
          />
        </div>
        
        {/* Código 404 */}
        <h1 className="mb-2 text-7xl font-bold text-primary">404</h1>
        
        {/* Leyenda en español */}
        <p className="mb-2 text-2xl font-semibold text-foreground">
          Página no encontrada
        </p>
        <p className="mb-6 text-muted-foreground">
          ¡Ups! Parece que esta página está en construcción o no existe.
        </p>
        
        {/* Ruta intentada */}
        <p className="mb-6 text-sm text-muted-foreground bg-muted/50 px-3 py-2 rounded-md inline-block font-mono">
          {location.pathname}
        </p>
        
        {/* Botones de navegación */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver atrás
          </Button>
          <Button asChild>
            <Link to="/dashboard">
              <Home className="mr-2 h-4 w-4" />
              Ir al Dashboard
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
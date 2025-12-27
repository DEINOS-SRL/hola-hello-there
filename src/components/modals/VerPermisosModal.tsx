import { useQuery } from '@tanstack/react-query';
import { Loader2, Shield, CheckCircle2, Package } from 'lucide-react';
import { segClient } from '@/modules/security/services/segClient';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface VerPermisosModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  rol: {
    id: string;
    nombre: string;
    descripcion?: string;
  } | null;
}

interface Permiso {
  id: string;
  nombre: string;
  descripcion: string | null;
  modulo: string;
}

// Colores por módulo
const moduloColors: Record<string, string> = {
  security: 'bg-violet-500/10 text-violet-700 border-violet-200 dark:text-violet-400 dark:border-violet-800',
  employees: 'bg-blue-500/10 text-blue-700 border-blue-200 dark:text-blue-400 dark:border-blue-800',
  equipos: 'bg-emerald-500/10 text-emerald-700 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800',
  movimientos: 'bg-orange-500/10 text-orange-700 border-orange-200 dark:text-orange-400 dark:border-orange-800',
  'partes-diarios': 'bg-pink-500/10 text-pink-700 border-pink-200 dark:text-pink-400 dark:border-pink-800',
  habilitaciones: 'bg-cyan-500/10 text-cyan-700 border-cyan-200 dark:text-cyan-400 dark:border-cyan-800',
};

const moduloLabels: Record<string, string> = {
  security: 'Seguridad',
  employees: 'Empleados',
  equipos: 'Equipos',
  movimientos: 'Movimientos',
  'partes-diarios': 'Partes Diarios',
  habilitaciones: 'Habilitaciones',
};

export function VerPermisosModal({ open, onOpenChange, rol }: VerPermisosModalProps) {
  // Fetch permisos del rol
  const { data: permisos, isLoading } = useQuery({
    queryKey: ['rol-permisos', rol?.id],
    queryFn: async () => {
      if (!rol?.id) return [];
      
      const { data, error } = await segClient
        .from('rol_permiso')
        .select(`
          permiso_id,
          permisos(id, nombre, descripcion, modulo)
        `)
        .eq('rol_id', rol.id);
      
      if (error) throw error;
      
      return (data || []).map((rp: any) => rp.permisos as Permiso).filter(Boolean);
    },
    enabled: open && !!rol?.id,
  });

  // Agrupar permisos por módulo
  const permisosByModulo = (permisos || []).reduce((acc: Record<string, Permiso[]>, p: Permiso) => {
    const modulo = p.modulo || 'otros';
    if (!acc[modulo]) acc[modulo] = [];
    acc[modulo].push(p);
    return acc;
  }, {});

  const modulos = Object.keys(permisosByModulo).sort();

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent size="lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Permisos del Rol
          </DialogTitle>
          <DialogDescription>
            {rol ? (
              <>
                <strong>{rol.nombre}</strong>
                {rol.descripcion && (
                  <span className="text-muted-foreground"> — {rol.descripcion}</span>
                )}
              </>
            ) : (
              'Selecciona un rol'
            )}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : !permisos || permisos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-32 text-muted-foreground">
            <Shield className="h-10 w-10 mb-2 opacity-30" />
            <p>Este rol no tiene permisos asignados</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="flex items-center gap-2 text-sm">
              <Badge variant="secondary" className="gap-1">
                <CheckCircle2 className="h-3 w-3" />
                {permisos.length} permisos
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Package className="h-3 w-3" />
                {modulos.length} módulos
              </Badge>
            </div>

            <Separator />

            {/* Lista de permisos por módulo */}
            <ScrollArea className="h-[350px] pr-4">
              <div className="space-y-6">
                {modulos.map((modulo) => (
                  <div key={modulo} className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`text-xs font-medium ${moduloColors[modulo] || 'bg-gray-500/10 text-gray-700 border-gray-200'}`}
                      >
                        {moduloLabels[modulo] || modulo}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        ({permisosByModulo[modulo].length})
                      </span>
                    </div>
                    
                    <div className="grid gap-2 pl-2">
                      {permisosByModulo[modulo].map((permiso: Permiso) => (
                        <div 
                          key={permiso.id}
                          className="flex items-start gap-2 p-2 rounded-md bg-muted/30 hover:bg-muted/50 transition-colors"
                        >
                          <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                          <div className="space-y-0.5">
                            <p className="text-sm font-medium">{permiso.nombre}</p>
                            {permiso.descripcion && (
                              <p className="text-xs text-muted-foreground">
                                {permiso.descripcion}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

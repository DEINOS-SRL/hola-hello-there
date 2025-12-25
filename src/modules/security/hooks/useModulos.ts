import { useQuery } from '@tanstack/react-query';
import { segClient } from '@/modules/security/services/segClient';

export interface ModuloDB {
  id: string;
  nombre: string;
  descripcion?: string;
  icono: string;
  ruta: string;
  orden: number;
  activo: boolean;
  modulo_padre_id: string | null;
  permisos_requeridos?: string[];
  codigo?: string;
}

export interface ModuloConHijos extends ModuloDB {
  hijos: ModuloConHijos[];
}

// Construye el árbol jerárquico de módulos
function buildModuloTree(modulos: ModuloDB[]): ModuloConHijos[] {
  const modulosMap = new Map<string, ModuloConHijos>();
  
  // Solo módulos activos
  const activos = modulos.filter(m => m.activo);
  
  activos.forEach(m => {
    modulosMap.set(m.id, { ...m, hijos: [] });
  });
  
  const raices: ModuloConHijos[] = [];
  
  activos.forEach(m => {
    const nodo = modulosMap.get(m.id)!;
    if (m.modulo_padre_id && modulosMap.has(m.modulo_padre_id)) {
      modulosMap.get(m.modulo_padre_id)!.hijos.push(nodo);
    } else {
      raices.push(nodo);
    }
  });
  
  // Ordenar por orden y nombre
  const sortNodes = (nodes: ModuloConHijos[]) => {
    nodes.sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));
    nodes.forEach(n => sortNodes(n.hijos));
  };
  sortNodes(raices);
  
  return raices;
}

export function useModulosDB() {
  const query = useQuery({
    queryKey: ['modulos-sidebar'],
    queryFn: async () => {
      const { data, error } = await segClient
        .from('modulos')
        .select('*')
        .eq('activo', true)
        .order('orden', { ascending: true })
        .order('nombre', { ascending: true });
      
      if (error) throw error;
      return data as ModuloDB[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos de cache
  });

  const arbol = query.data ? buildModuloTree(query.data) : [];

  return {
    modulos: query.data || [],
    arbol,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

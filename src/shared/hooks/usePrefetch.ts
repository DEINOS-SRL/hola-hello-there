import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';
import { segClient } from '@/modules/security/services/segClient';
import { rrhhClient } from '@/modules/rrhh/services/rrhhClient';
import { equClient } from '@/modules/equipos/services/equClient';
import { movClient } from '@/modules/operacion/services/movClient';

// Definir las queries de prefetch por ruta
const prefetchConfigs: Record<string, {
  queryKey: string[];
  queryFn: () => Promise<any>;
  staleTime?: number;
}[]> = {
  // Seguridad / Administración
  '/configuracion/administracion/usuarios': [
    {
      queryKey: ['usuarios'],
      queryFn: async () => {
        const { data } = await segClient
          .from('usuarios')
          .select('*, empresa:empresas(id, nombre)')
          .order('nombre');
        return data;
      },
      staleTime: 1000 * 60 * 2, // 2 min
    },
  ],
  '/configuracion/administracion/empresas': [
    {
      queryKey: ['empresas-list'],
      queryFn: async () => {
        const { data } = await segClient
          .from('empresas')
          .select('*')
          .order('nombre');
        return data;
      },
      staleTime: 1000 * 60 * 5,
    },
  ],
  '/configuracion/administracion/roles': [
    {
      queryKey: ['roles'],
      queryFn: async () => {
        const { data } = await segClient
          .from('roles')
          .select('*')
          .order('nombre');
        return data;
      },
      staleTime: 1000 * 60 * 5,
    },
  ],
  // RRHH
  '/rrhh/empleados': [
    {
      queryKey: ['empleados'],
      queryFn: async () => {
        const { data } = await rrhhClient
          .from('empleados')
          .select('*')
          .order('apellido');
        return data;
      },
      staleTime: 1000 * 60 * 2,
    },
  ],
  '/rrhh/partes-diarios': [
    {
      queryKey: ['partes-diarios'],
      queryFn: async () => {
        const { data } = await rrhhClient
          .from('partes_diarios')
          .select('*, empleado:empleados(id, nombre, apellido)')
          .order('fecha', { ascending: false })
          .limit(50);
        return data;
      },
      staleTime: 1000 * 60 * 1,
    },
  ],
  // Equipos
  '/equipos/listado': [
    {
      queryKey: ['equipos'],
      queryFn: async () => {
        const { data } = await equClient
          .from('equipos')
          .select('*')
          .order('codigo');
        return data;
      },
      staleTime: 1000 * 60 * 3,
    },
  ],
  // Operación
  '/operacion/movimientos': [
    {
      queryKey: ['movimientos'],
      queryFn: async () => {
        const { data } = await movClient
          .from('movimientos')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(50);
        return data;
      },
      staleTime: 1000 * 60 * 1,
    },
  ],
};

// Hook para prefetch de datos
export function usePrefetch() {
  const queryClient = useQueryClient();

  const prefetch = useCallback((path: string) => {
    const configs = prefetchConfigs[path];
    if (!configs) return;

    configs.forEach(config => {
      // Solo prefetch si no está ya en cache o está stale
      const existingData = queryClient.getQueryData(config.queryKey);
      if (!existingData) {
        queryClient.prefetchQuery({
          queryKey: config.queryKey,
          queryFn: config.queryFn,
          staleTime: config.staleTime || 1000 * 60 * 2,
        });
      }
    });
  }, [queryClient]);

  // Prefetch con debounce para evitar múltiples llamadas
  const prefetchOnHover = useCallback((path: string) => {
    // Pequeño delay para evitar prefetch en hover accidentales
    const timeoutId = setTimeout(() => prefetch(path), 150);
    return () => clearTimeout(timeoutId);
  }, [prefetch]);

  return { prefetch, prefetchOnHover };
}

// Lista de rutas que soportan prefetch (para mostrar indicador visual si se desea)
export const prefetchableRoutes = Object.keys(prefetchConfigs);

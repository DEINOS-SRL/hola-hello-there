import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { empleadosService } from '../services/empleadosService';
import type { EmpleadoInsert, EmpleadoUpdate } from '../types';
import { useToast } from '@/hooks/use-toast';

const QUERY_KEY = ['empleados'];

export function useEmpleados() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const query = useQuery({
    queryKey: QUERY_KEY,
    queryFn: empleadosService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: EmpleadoInsert) => empleadosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: 'Éxito', description: 'Empleado creado correctamente' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: EmpleadoUpdate) => empleadosService.update(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: 'Éxito', description: 'Empleado actualizado correctamente' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => empleadosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: 'Éxito', description: 'Empleado eliminado correctamente' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: 'activo' | 'licencia' | 'baja' }) =>
      empleadosService.updateEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: 'Éxito', description: 'Estado actualizado correctamente' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    empleados: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    create: createMutation.mutateAsync,
    update: updateMutation.mutateAsync,
    remove: deleteMutation.mutateAsync,
    updateEstado: updateEstadoMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

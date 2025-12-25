import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientosService } from '../services/movimientosService';
import type { MovimientoInsert, MovimientoUpdate, EstadoMovimiento } from '../types';
import { toast } from 'sonner';

const QUERY_KEY = ['movimientos'];

export function useMovimientos() {
  const queryClient = useQueryClient();

  const { data: movimientos = [], isLoading, error, refetch } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: movimientosService.getAll,
  });

  const createMutation = useMutation({
    mutationFn: (data: MovimientoInsert) => movimientosService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Movimiento creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear movimiento: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: MovimientoUpdate }) =>
      movimientosService.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Movimiento actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar movimiento: ${error.message}`);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => movimientosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Movimiento eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar movimiento: ${error.message}`);
    },
  });

  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, estado }: { id: string; estado: EstadoMovimiento }) =>
      movimientosService.updateEstado(id, estado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Estado actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar estado: ${error.message}`);
    },
  });

  return {
    movimientos,
    isLoading,
    error,
    refetch,
    createMovimiento: createMutation.mutateAsync,
    updateMovimiento: updateMutation.mutateAsync,
    deleteMovimiento: deleteMutation.mutateAsync,
    updateEstado: updateEstadoMutation.mutateAsync,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}

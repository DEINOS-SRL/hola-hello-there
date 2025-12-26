import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as service from '../services/partesDiariosService';
import type { CreateParteDiarioInput, UpdateParteDiarioInput, EstadoNovedad } from '../types/partesDiarios';

export function usePartesDiarios() {
  return useQuery({
    queryKey: ['partes-diarios'],
    queryFn: service.getPartesDiarios,
  });
}

export function useParteDiario(id: string | undefined) {
  return useQuery({
    queryKey: ['partes-diarios', id],
    queryFn: () => service.getParteDiarioById(id!),
    enabled: !!id,
  });
}

export function useParteDiarioByFecha(empleadoId: string | undefined, fecha: string | undefined) {
  return useQuery({
    queryKey: ['partes-diarios', 'fecha', empleadoId, fecha],
    queryFn: () => service.getParteDiarioByFecha(empleadoId!, fecha!),
    enabled: !!empleadoId && !!fecha,
  });
}

export function useCreateParteDiario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateParteDiarioInput & { empresa_id?: string }) => service.createParteDiario(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partes-diarios'] });
      toast.success('Parte diario enviado correctamente');
    },
    onError: (error: Error) => {
      if (error.message.includes('unique constraint')) {
        toast.error('Ya existe un parte diario para hoy');
      } else if (error.message.includes('empresa')) {
        toast.error('Error: No tienes una empresa asignada. Contacta al administrador.');
      } else {
        toast.error('Error al enviar el parte diario', {
          description: error.message,
        });
      }
    },
  });
}

export function useUpdateParteDiario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateParteDiarioInput }) => 
      service.updateParteDiario(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partes-diarios'] });
      toast.success('Parte diario actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el parte diario');
    },
  });
}

export function useDeleteParteDiario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: service.deleteParteDiario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partes-diarios'] });
      toast.success('Parte diario eliminado');
    },
    onError: () => {
      toast.error('Error al eliminar el parte diario');
    },
  });
}

export function useAddNovedad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ parteId, novedad }: { 
      parteId: string; 
      novedad: Parameters<typeof service.addNovedad>[1] 
    }) => service.addNovedad(parteId, novedad),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partes-diarios'] });
      toast.success('Novedad agregada');
    },
    onError: () => {
      toast.error('Error al agregar la novedad');
    },
  });
}

export function useUpdateNovedadEstado() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, estado, respuesta }: { id: string; estado: EstadoNovedad; respuesta?: string }) => 
      service.updateNovedadEstado(id, estado, respuesta),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partes-diarios'] });
      toast.success('Estado de novedad actualizado');
    },
    onError: () => {
      toast.error('Error al actualizar el estado');
    },
  });
}

export function useDeleteNovedad() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: service.deleteNovedad,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['partes-diarios'] });
      toast.success('Novedad eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar la novedad');
    },
  });
}

export function useNovedadesStats() {
  return useQuery({
    queryKey: ['partes-diarios', 'stats'],
    queryFn: service.getNovedadesStats,
  });
}

export function useUploadNovedadFoto() {
  return useMutation({
    mutationFn: service.uploadNovedadFoto,
    onError: () => {
      toast.error('Error al subir la foto');
    },
  });
}

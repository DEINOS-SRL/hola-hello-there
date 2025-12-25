import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as presupuestosService from '../services/presupuestosService';
import type { PresupuestoFormData, PresupuestoItemFormData } from '../types';

const QUERY_KEY = ['presupuestos'];

export function usePresupuestos() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: presupuestosService.getPresupuestos,
  });
}

export function usePresupuesto(id: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, id],
    queryFn: () => presupuestosService.getPresupuestoById(id!),
    enabled: !!id,
  });
}

export function useNextNumeroPresupuesto() {
  return useQuery({
    queryKey: ['next-numero-presupuesto'],
    queryFn: presupuestosService.getNextNumeroPresupuesto,
  });
}

export function useCreatePresupuesto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: PresupuestoFormData) => presupuestosService.createPresupuesto(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      queryClient.invalidateQueries({ queryKey: ['next-numero-presupuesto'] });
      toast.success('Presupuesto creado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear presupuesto: ${error.message}`);
    },
  });
}

export function useUpdatePresupuesto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PresupuestoFormData> }) => 
      presupuestosService.updatePresupuesto(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Presupuesto actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar presupuesto: ${error.message}`);
    },
  });
}

export function useDeletePresupuesto() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => presupuestosService.deletePresupuesto(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Presupuesto eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar presupuesto: ${error.message}`);
    },
  });
}

// Items
export function usePresupuestoItems(presupuestoId: string | undefined) {
  return useQuery({
    queryKey: [...QUERY_KEY, presupuestoId, 'items'],
    queryFn: () => presupuestosService.getPresupuestoItems(presupuestoId!),
    enabled: !!presupuestoId,
  });
}

export function useCreatePresupuestoItem() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ presupuestoId, data }: { presupuestoId: string; data: PresupuestoItemFormData }) => 
      presupuestosService.createPresupuestoItem(presupuestoId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, variables.presupuestoId, 'items'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Ítem agregado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al agregar ítem: ${error.message}`);
    },
  });
}

export function useUpdatePresupuestoItem(presupuestoId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PresupuestoItemFormData> }) => 
      presupuestosService.updatePresupuestoItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, presupuestoId, 'items'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Ítem actualizado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar ítem: ${error.message}`);
    },
  });
}

export function useDeletePresupuestoItem(presupuestoId: string) {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => presupuestosService.deletePresupuestoItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [...QUERY_KEY, presupuestoId, 'items'] });
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast.success('Ítem eliminado correctamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar ítem: ${error.message}`);
    },
  });
}

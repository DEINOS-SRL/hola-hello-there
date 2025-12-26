import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  getEquipos,
  getEquipoById,
  createEquipo,
  updateEquipo,
  deleteEquipo,
  getNextCodigoEquipo,
  getTiposEquipo,
  createTipoEquipo,
  getMarcas,
  createMarca,
  getModelos,
  createModelo,
} from '../services/equiposService';
import type { EquipoFormData, TipoEquipoFormData, MarcaFormData, ModeloFormData } from '../types';

// ============= EQUIPOS =============
export const useEquipos = () => {
  return useQuery({
    queryKey: ['equipos'],
    queryFn: getEquipos,
  });
};

export const useEquipo = (id: string) => {
  return useQuery({
    queryKey: ['equipos', id],
    queryFn: () => getEquipoById(id),
    enabled: !!id,
  });
};

export const useNextCodigoEquipo = () => {
  return useQuery({
    queryKey: ['equipos', 'nextCodigo'],
    queryFn: getNextCodigoEquipo,
  });
};

export const useCreateEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ empresaId, formData }: { empresaId: string; formData: EquipoFormData }) =>
      createEquipo(empresaId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
      toast.success('Equipo creado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al crear equipo: ${error.message}`);
    },
  });
};

export const useUpdateEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, formData }: { id: string; formData: EquipoFormData }) =>
      updateEquipo(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
      toast.success('Equipo actualizado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al actualizar equipo: ${error.message}`);
    },
  });
};

export const useDeleteEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteEquipo,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipos'] });
      toast.success('Equipo eliminado exitosamente');
    },
    onError: (error: Error) => {
      toast.error(`Error al eliminar equipo: ${error.message}`);
    },
  });
};

// ============= TIPOS DE EQUIPO =============
export const useTiposEquipo = () => {
  return useQuery({
    queryKey: ['tipos-equipo'],
    queryFn: getTiposEquipo,
  });
};

export const useCreateTipoEquipo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ empresaId, formData }: { empresaId: string; formData: TipoEquipoFormData }) =>
      createTipoEquipo(empresaId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tipos-equipo'] });
      toast.success('Tipo de equipo creado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

// ============= MARCAS =============
export const useMarcas = () => {
  return useQuery({
    queryKey: ['marcas'],
    queryFn: getMarcas,
  });
};

export const useCreateMarca = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ empresaId, formData }: { empresaId: string; formData: MarcaFormData }) =>
      createMarca(empresaId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['marcas'] });
      toast.success('Marca creada');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

// ============= MODELOS =============
export const useModelos = (marcaId?: string) => {
  return useQuery({
    queryKey: ['modelos', marcaId],
    queryFn: () => getModelos(marcaId),
  });
};

export const useCreateModelo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ empresaId, formData }: { empresaId: string; formData: ModeloFormData }) =>
      createModelo(empresaId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelos'] });
      toast.success('Modelo creado');
    },
    onError: (error: Error) => {
      toast.error(`Error: ${error.message}`);
    },
  });
};

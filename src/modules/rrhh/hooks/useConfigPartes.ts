import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import * as service from '../services/configPartesService';
import type { UpsertConfigInput } from '../services/configPartesService';

export function useConfigParteDiario() {
  return useQuery({
    queryKey: ['config-parte-diario'],
    queryFn: service.getConfigParteDiario,
  });
}

export function useUpsertConfigParteDiario() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpsertConfigInput) => service.upsertConfigParteDiario(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['config-parte-diario'] });
      toast.success('Configuración guardada');
    },
    onError: () => {
      toast.error('Error al guardar la configuración');
    },
  });
}

export function useHasSubmittedParteToday() {
  return useQuery({
    queryKey: ['has-submitted-parte-today'],
    queryFn: service.hasSubmittedParteToday,
    refetchInterval: 60000, // Refresh every minute
  });
}

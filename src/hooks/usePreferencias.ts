import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/contexts/AuthContext';
import { getPreferencias, savePreferencias, PreferenciasUsuario } from '@/services/preferenciasService';
import { toast } from 'sonner';

export function usePreferencias() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: preferencias, isLoading, error } = useQuery({
    queryKey: ['preferencias', user?.id],
    queryFn: () => getPreferencias(user!.id),
    enabled: !!user?.id,
  });

  const mutation = useMutation({
    mutationFn: savePreferencias,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['preferencias', user?.id] });
      toast.success('Preferencias guardadas correctamente');
    },
    onError: (error) => {
      console.error('Error saving preferences:', error);
      toast.error('Error al guardar las preferencias');
    },
  });

  const updatePreferencias = (updates: Partial<PreferenciasUsuario>) => {
    if (!preferencias) return;
    mutation.mutate({ ...preferencias, ...updates });
  };

  return {
    preferencias,
    isLoading,
    error,
    updatePreferencias,
    isSaving: mutation.isPending,
  };
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getHistorialByFeedback, 
  createHistorial,
  CreateHistorialInput 
} from '../services/feedbackHistorialService';
import { toast } from 'sonner';

export function useFeedbackHistorial(feedbackId: string | null) {
  const queryClient = useQueryClient();

  const { data: historial, isLoading, error, refetch } = useQuery({
    queryKey: ['feedback-historial', feedbackId],
    queryFn: () => feedbackId ? getHistorialByFeedback(feedbackId) : Promise.resolve([]),
    enabled: !!feedbackId,
  });

  const createMutation = useMutation({
    mutationFn: createHistorial,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-historial', feedbackId] });
    },
    onError: (error) => {
      console.error('Error creating historial:', error);
      toast.error('Error al registrar cambio de estado');
    },
  });

  return {
    historial: historial || [],
    isLoading,
    error,
    refetch,
    createHistorial: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}

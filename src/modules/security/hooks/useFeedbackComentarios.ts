import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getComentariosByFeedback, 
  createComentario,
  CreateComentarioInput 
} from '../services/feedbackComentariosService';
import { toast } from 'sonner';
import { segClient } from '../services/segClient';

export function useFeedbackComentarios(feedbackId: string | null) {
  const queryClient = useQueryClient();

  const { data: comentarios, isLoading, error, refetch } = useQuery({
    queryKey: ['feedback-comentarios', feedbackId],
    queryFn: () => feedbackId ? getComentariosByFeedback(feedbackId) : Promise.resolve([]),
    enabled: !!feedbackId,
  });

  // Realtime subscription para nuevos comentarios
  useEffect(() => {
    if (!feedbackId) return;

    const channel = segClient
      .channel(`feedback-comentarios-${feedbackId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'seg',
          table: 'feedback_comentarios',
          filter: `feedback_id=eq.${feedbackId}`
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['feedback-comentarios', feedbackId] });
        }
      )
      .subscribe();

    return () => {
      segClient.removeChannel(channel);
    };
  }, [feedbackId, queryClient]);

  const createMutation = useMutation({
    mutationFn: createComentario,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedback-comentarios', feedbackId] });
      toast.success('Comentario agregado');
    },
    onError: (error) => {
      console.error('Error creating comentario:', error);
      toast.error('Error al agregar comentario');
    },
  });

  return {
    comentarios: comentarios || [],
    isLoading,
    error,
    refetch,
    createComentario: createMutation.mutate,
    isCreating: createMutation.isPending,
  };
}

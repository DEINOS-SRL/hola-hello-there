import { useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  getFeedbacks, 
  createFeedback, 
  updateFeedback, 
  respondToFeedback,
  getMyFeedbacks,
  getUsuariosAsignables,
  asignarFeedback,
  CreateFeedbackInput,
  UpdateFeedbackInput,
  Feedback,
  UsuarioAsignable
} from '../services/feedbacksService';
import { toast } from 'sonner';
import { segClient } from '../services/segClient';
import { playNotificationSound } from '@/lib/sounds';

export function useFeedbacks() {
  const queryClient = useQueryClient();

  const { data: feedbacks, isLoading, error, refetch } = useQuery({
    queryKey: ['feedbacks'],
    queryFn: getFeedbacks,
  });

  // Query para usuarios asignables
  const { data: usuariosAsignables } = useQuery({
    queryKey: ['usuarios-asignables'],
    queryFn: getUsuariosAsignables,
  });

  // Realtime subscription para nuevos feedbacks
  useEffect(() => {
    const channel = segClient
      .channel('feedbacks-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'seg',
          table: 'feedbacks'
        },
        (payload) => {
          console.log('Nuevo feedback recibido:', payload);
          // Reproducir sonido de notificación
          playNotificationSound();
          toast.info('Nuevo feedback recibido', {
            description: `Tipo: ${payload.new?.tipo || 'desconocido'}`,
            duration: 5000,
          });
          queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'seg',
          table: 'feedbacks'
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
        }
      )
      .subscribe();

    return () => {
      segClient.removeChannel(channel);
    };
  }, [queryClient]);

  const createMutation = useMutation({
    mutationFn: createFeedback,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Feedback enviado correctamente');
    },
    onError: (error) => {
      console.error('Error creating feedback:', error);
      toast.error('Error al enviar el feedback');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateFeedbackInput }) => 
      updateFeedback(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Feedback actualizado');
    },
    onError: (error) => {
      console.error('Error updating feedback:', error);
      toast.error('Error al actualizar el feedback');
    },
  });

  const respondMutation = useMutation({
    mutationFn: ({ id, respuesta, respondidoPor }: { 
      id: string; 
      respuesta: string; 
      respondidoPor: string 
    }) => respondToFeedback(id, respuesta, respondidoPor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Respuesta enviada');
    },
    onError: (error) => {
      console.error('Error responding to feedback:', error);
      toast.error('Error al responder el feedback');
    },
  });

  // Mutation para asignar feedback
  const asignarMutation = useMutation({
    mutationFn: ({ feedbackId, asignadoA, asignadoPor }: { 
      feedbackId: string; 
      asignadoA: string | null; 
      asignadoPor: string 
    }) => asignarFeedback(feedbackId, asignadoA, asignadoPor),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Feedback asignado correctamente');
    },
    onError: (error) => {
      console.error('Error asignando feedback:', error);
      toast.error('Error al asignar el feedback');
    },
  });

  const getStatusBadgeVariant = (estado: Feedback['estado']) => {
    switch (estado) {
      case 'pendiente': return 'secondary';
      case 'en_revision': return 'default';
      case 'resuelto': return 'success';
      case 'cerrado': return 'outline';
      default: return 'secondary';
    }
  };

  const getTipoBadgeVariant = (tipo: Feedback['tipo']) => {
    switch (tipo) {
      case 'bug': return 'destructive';
      case 'queja': return 'destructive';
      case 'mejora': return 'default';
      case 'sugerencia': return 'secondary';
      case 'consulta': return 'outline';
      case 'ayuda': return 'outline';
      case 'acceso-permiso': return 'secondary';
      default: return 'secondary';
    }
  };

  return {
    feedbacks: feedbacks || [],
    usuariosAsignables: usuariosAsignables || [],
    isLoading,
    error,
    refetch,
    createFeedback: createMutation.mutate,
    updateFeedback: updateMutation.mutate,
    respondToFeedback: respondMutation.mutate,
    asignarFeedback: asignarMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isResponding: respondMutation.isPending,
    isAsignando: asignarMutation.isPending,
    getStatusBadgeVariant,
    getTipoBadgeVariant,
  };
}

export function useMyFeedbacks() {
  const { data: feedbacks, isLoading, error, refetch } = useQuery({
    queryKey: ['my-feedbacks'],
    queryFn: getMyFeedbacks,
  });

  const getStatusBadgeVariant = (estado: Feedback['estado']) => {
    switch (estado) {
      case 'pendiente': return 'secondary';
      case 'en_revision': return 'default';
      case 'resuelto': return 'success';
      case 'cerrado': return 'outline';
      default: return 'secondary';
    }
  };

  const getTipoBadgeVariant = (tipo: Feedback['tipo']) => {
    switch (tipo) {
      case 'bug': return 'destructive';
      case 'queja': return 'destructive';
      case 'mejora': return 'default';
      case 'sugerencia': return 'secondary';
      case 'consulta': return 'outline';
      case 'ayuda': return 'outline';
      case 'acceso-permiso': return 'secondary';
      default: return 'secondary';
    }
  };

  const getStatusLabel = (estado: Feedback['estado']) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'en_revision': return 'En revisión';
      case 'resuelto': return 'Resuelto';
      case 'cerrado': return 'Cerrado';
      default: return estado;
    }
  };

  const getTipoLabel = (tipo: Feedback['tipo']) => {
    switch (tipo) {
      case 'sugerencia': return 'Sugerencia';
      case 'mejora': return 'Mejora';
      case 'queja': return 'Queja';
      case 'bug': return 'Bug';
      case 'consulta': return 'Consulta';
      case 'ayuda': return 'Ayuda';
      case 'acceso-permiso': return 'Acceso/Permiso';
      default: return tipo;
    }
  };

  return {
    feedbacks: feedbacks || [],
    isLoading,
    error,
    refetch,
    getStatusBadgeVariant,
    getTipoBadgeVariant,
    getStatusLabel,
    getTipoLabel,
  };
}

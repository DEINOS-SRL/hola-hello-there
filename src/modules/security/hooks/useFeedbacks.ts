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
  toggleDestacado,
  CreateFeedbackInput,
  UpdateFeedbackInput,
  Feedback,
  UsuarioAsignable
} from '../services/feedbacksService';
import { crearNotificacion } from '../services/notificacionesService';
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
    mutationFn: async ({ feedbackId, asignadoA, asignadoPor, empresaId, feedbackTipo }: { 
      feedbackId: string; 
      asignadoA: string | null; 
      asignadoPor: string;
      empresaId?: string;
      feedbackTipo?: string;
    }) => {
      const result = await asignarFeedback(feedbackId, asignadoA, asignadoPor);
      
      // Crear notificación para el usuario asignado
      if (asignadoA && empresaId) {
        try {
          await crearNotificacion({
            empresa_id: empresaId,
            usuario_id: asignadoA,
            titulo: 'Nuevo feedback asignado',
            mensaje: `Se te ha asignado un feedback de tipo "${feedbackTipo || 'general'}" para seguimiento.`,
            tipo: 'message',
          });
        } catch (err) {
          console.error('Error creating notification:', err);
          // No bloqueamos la asignación si falla la notificación
        }
      }
      
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
      toast.success('Feedback asignado correctamente');
    },
    onError: (error) => {
      console.error('Error asignando feedback:', error);
      toast.error('Error al asignar el feedback');
    },
  });

  // Mutation para togglear destacado con optimistic update
  const toggleDestacadoMutation = useMutation({
    mutationFn: ({ id, destacado }: { id: string; destacado: boolean }) => 
      toggleDestacado(id, destacado),
    onMutate: async ({ id, destacado }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['feedbacks'] });
      
      // Snapshot previous value
      const previousFeedbacks = queryClient.getQueryData<Feedback[]>(['feedbacks']);
      
      // Optimistically update
      queryClient.setQueryData<Feedback[]>(['feedbacks'], (old) => 
        old?.map(f => f.id === id ? { ...f, destacado } : f) || []
      );
      
      return { previousFeedbacks };
    },
    onSuccess: (_, { destacado }) => {
      toast.success(destacado ? 'Feedback destacado' : 'Destacado removido');
    },
    onError: (error, _, context) => {
      // Rollback on error
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(['feedbacks'], context.previousFeedbacks);
      }
      console.error('Error toggling destacado:', error);
      toast.error('Error al cambiar destacado');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
    },
  });

  // Mutation para bulk toggle destacados
  const bulkToggleDestacadoMutation = useMutation({
    mutationFn: async ({ ids, destacado }: { ids: string[]; destacado: boolean }) => {
      for (const id of ids) {
        await toggleDestacado(id, destacado);
      }
    },
    onMutate: async ({ ids, destacado }) => {
      await queryClient.cancelQueries({ queryKey: ['feedbacks'] });
      const previousFeedbacks = queryClient.getQueryData<Feedback[]>(['feedbacks']);
      
      queryClient.setQueryData<Feedback[]>(['feedbacks'], (old) => 
        old?.map(f => ids.includes(f.id) ? { ...f, destacado } : f) || []
      );
      
      return { previousFeedbacks };
    },
    onSuccess: (_, { ids, destacado }) => {
      toast.success(destacado ? `${ids.length} feedbacks destacados` : `${ids.length} destacados removidos`);
    },
    onError: (error, _, context) => {
      if (context?.previousFeedbacks) {
        queryClient.setQueryData(['feedbacks'], context.previousFeedbacks);
      }
      console.error('Error bulk toggling destacado:', error);
      toast.error('Error al cambiar destacados');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['feedbacks'] });
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
    toggleDestacado: toggleDestacadoMutation.mutate,
    bulkToggleDestacado: bulkToggleDestacadoMutation.mutate,
    isCreating: createMutation.isPending,
    isUpdating: updateMutation.isPending,
    isResponding: respondMutation.isPending,
    isAsignando: asignarMutation.isPending,
    isTogglingDestacado: toggleDestacadoMutation.isPending,
    isBulkToggling: bulkToggleDestacadoMutation.isPending,
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

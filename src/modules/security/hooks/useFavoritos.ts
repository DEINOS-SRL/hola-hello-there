import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { favoritosService, FavoritoConModulo } from '../services/favoritosService';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export function useFavoritos() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoritos = [], isLoading, error } = useQuery({
    queryKey: ['favoritos', user?.id],
    queryFn: () => favoritosService.getFavoritos(),
    enabled: !!user?.id,
  });

  const addFavoritoMutation = useMutation({
    mutationFn: (moduloId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return favoritosService.addFavorito(user.id, moduloId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] });
      toast.success('Agregado a favoritos');
    },
    onError: (error: Error) => {
      console.error('Error adding favorito:', error);
      toast.error('Error al agregar a favoritos');
    },
  });

  const removeFavoritoMutation = useMutation({
    mutationFn: (moduloId: string) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      return favoritosService.removeFavoritoByModulo(user.id, moduloId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] });
      toast.success('Eliminado de favoritos');
    },
    onError: (error: Error) => {
      console.error('Error removing favorito:', error);
      toast.error('Error al eliminar de favoritos');
    },
  });

  const reorderMutation = useMutation({
    mutationFn: (orderedFavoritos: FavoritoConModulo[]) => {
      if (!user?.id) throw new Error('Usuario no autenticado');
      const orderedIds = orderedFavoritos.map((f, index) => ({ id: f.id, orden: index }));
      return favoritosService.reorderFavoritos(user.id, orderedIds);
    },
    onMutate: async (newOrder) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['favoritos', user?.id] });
      
      // Snapshot previous value
      const previousFavoritos = queryClient.getQueryData<FavoritoConModulo[]>(['favoritos', user?.id]);
      
      // Optimistically update
      queryClient.setQueryData<FavoritoConModulo[]>(['favoritos', user?.id], newOrder);
      
      return { previousFavoritos };
    },
    onError: (err, newOrder, context) => {
      // Rollback on error
      if (context?.previousFavoritos) {
        queryClient.setQueryData(['favoritos', user?.id], context.previousFavoritos);
      }
      toast.error('Error al reordenar favoritos');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['favoritos'] });
    },
  });

  const toggleFavorito = (moduloId: string) => {
    const isFav = favoritos.some(f => f.modulo_id === moduloId);
    if (isFav) {
      removeFavoritoMutation.mutate(moduloId);
    } else {
      addFavoritoMutation.mutate(moduloId);
    }
  };

  const isFavorito = (moduloId: string): boolean => {
    return favoritos.some(f => f.modulo_id === moduloId);
  };

  const reorderFavoritos = (newOrder: FavoritoConModulo[]) => {
    reorderMutation.mutate(newOrder);
  };

  return {
    favoritos,
    isLoading,
    error,
    addFavorito: addFavoritoMutation.mutate,
    removeFavorito: removeFavoritoMutation.mutate,
    toggleFavorito,
    isFavorito,
    reorderFavoritos,
    isAdding: addFavoritoMutation.isPending,
    isRemoving: removeFavoritoMutation.isPending,
    isReordering: reorderMutation.isPending,
  };
}

export type { FavoritoConModulo };

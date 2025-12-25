import { segClient } from './segClient';

export interface UsuarioFavorito {
  id: string;
  usuario_id: string;
  modulo_id: string;
  orden: number;
  created_at: string;
}

export interface FavoritoConModulo extends UsuarioFavorito {
  modulo: {
    id: string;
    nombre: string;
    icono: string;
    ruta: string;
  };
}

export const favoritosService = {
  async getFavoritos(): Promise<FavoritoConModulo[]> {
    const { data, error } = await segClient
      .from('usuario_favoritos')
      .select(`
        id,
        usuario_id,
        modulo_id,
        orden,
        created_at,
        modulo:modulos!modulo_id (
          id,
          nombre,
          icono,
          ruta
        )
      `)
      .order('orden', { ascending: true });

    if (error) throw error;
    return (data || []) as unknown as FavoritoConModulo[];
  },

  async addFavorito(usuarioId: string, moduloId: string): Promise<UsuarioFavorito> {
    // Obtener el siguiente orden
    const { data: existing } = await segClient
      .from('usuario_favoritos')
      .select('orden')
      .eq('usuario_id', usuarioId)
      .order('orden', { ascending: false })
      .limit(1);

    const nextOrden = existing && existing.length > 0 ? (existing[0].orden || 0) + 1 : 0;

    const { data, error } = await segClient
      .from('usuario_favoritos')
      .insert({
        usuario_id: usuarioId,
        modulo_id: moduloId,
        orden: nextOrden,
      })
      .select()
      .single();

    if (error) throw error;
    return data as UsuarioFavorito;
  },

  async removeFavorito(favoritoId: string): Promise<void> {
    const { error } = await segClient
      .from('usuario_favoritos')
      .delete()
      .eq('id', favoritoId);

    if (error) throw error;
  },

  async removeFavoritoByModulo(usuarioId: string, moduloId: string): Promise<void> {
    const { error } = await segClient
      .from('usuario_favoritos')
      .delete()
      .eq('usuario_id', usuarioId)
      .eq('modulo_id', moduloId);

    if (error) throw error;
  },

  async isFavorito(usuarioId: string, moduloId: string): Promise<boolean> {
    const { data, error } = await segClient
      .from('usuario_favoritos')
      .select('id')
      .eq('usuario_id', usuarioId)
      .eq('modulo_id', moduloId)
      .maybeSingle();

    if (error) throw error;
    return !!data;
  },

  async reorderFavoritos(usuarioId: string, orderedIds: { id: string; orden: number }[]): Promise<void> {
    // Actualizar el orden de cada favorito
    const updates = orderedIds.map(({ id, orden }) =>
      segClient
        .from('usuario_favoritos')
        .update({ orden })
        .eq('id', id)
        .eq('usuario_id', usuarioId)
    );

    const results = await Promise.all(updates);
    const error = results.find(r => r.error)?.error;
    if (error) throw error;
  },
};

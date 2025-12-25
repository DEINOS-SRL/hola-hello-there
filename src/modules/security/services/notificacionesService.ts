import { segClient } from './segClient';

export interface Notificacion {
  id: string;
  empresa_id: string;
  usuario_id: string;
  titulo: string;
  mensaje: string;
  tipo: 'info' | 'success' | 'warning' | 'message';
  leida: boolean;
  created_at: string;
  updated_at: string;
}

export async function fetchNotificaciones(): Promise<Notificacion[]> {
  const { data, error } = await segClient
    .from('notificaciones')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) {
    console.error('Error fetching notificaciones:', error);
    throw error;
  }

  return data || [];
}

export async function marcarComoLeida(id: string): Promise<void> {
  const { error } = await segClient
    .from('notificaciones')
    .update({ leida: true })
    .eq('id', id);

  if (error) {
    console.error('Error marking notificacion as read:', error);
    throw error;
  }
}

export async function marcarTodasComoLeidas(): Promise<void> {
  const { error } = await segClient
    .from('notificaciones')
    .update({ leida: true })
    .eq('leida', false);

  if (error) {
    console.error('Error marking all notificaciones as read:', error);
    throw error;
  }
}

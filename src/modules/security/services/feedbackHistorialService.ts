import { segClient } from './segClient';

export interface FeedbackHistorialEstado {
  id: string;
  feedback_id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario_id: string | null;
  usuario_email: string | null;
  usuario_nombre: string | null;
  created_at: string;
}

export interface CreateHistorialInput {
  feedback_id: string;
  estado_anterior: string | null;
  estado_nuevo: string;
  usuario_id?: string;
  usuario_email?: string;
  usuario_nombre?: string;
}

export async function getHistorialByFeedback(feedbackId: string): Promise<FeedbackHistorialEstado[]> {
  const { data, error } = await segClient
    .from('feedback_historial_estados')
    .select('*')
    .eq('feedback_id', feedbackId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching historial:', error);
    throw error;
  }

  return data || [];
}

export async function createHistorial(input: CreateHistorialInput): Promise<FeedbackHistorialEstado | null> {
  const { data, error } = await segClient
    .from('feedback_historial_estados')
    .insert(input)
    .select()
    .maybeSingle();

  if (error) {
    console.error('Error creating historial:', error);
    // Don't throw - historial is secondary, don't block state change
    return null;
  }

  return data;
}

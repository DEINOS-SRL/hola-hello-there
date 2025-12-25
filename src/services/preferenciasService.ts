import { segClient } from '@/modules/security/services/segClient';

export interface PreferenciasUsuario {
  id?: string;
  usuario_id: string;
  // Notificaciones
  email_notifications: boolean;
  push_notifications: boolean;
  desktop_notifications: boolean;
  new_messages: boolean;
  task_updates: boolean;
  system_alerts: boolean;
  weekly_digest: boolean;
  // Regional
  idioma: string;
  zona_horaria: string;
  formato_fecha: string;
  densidad_ui: string;
  tema: string;
  // Comportamiento
  preservar_scroll: boolean;
}

const defaultPreferencias: Omit<PreferenciasUsuario, 'id' | 'usuario_id'> = {
  email_notifications: true,
  push_notifications: false,
  desktop_notifications: true,
  new_messages: true,
  task_updates: true,
  system_alerts: true,
  weekly_digest: false,
  idioma: 'es',
  zona_horaria: 'America/Buenos_Aires',
  formato_fecha: 'dd/MM/yyyy',
  densidad_ui: 'comfortable',
  tema: 'system',
  preservar_scroll: true,
};

export async function getPreferencias(usuarioId: string): Promise<PreferenciasUsuario> {
  const { data, error } = await segClient
    .from('preferencias_usuario')
    .select('*')
    .eq('usuario_id', usuarioId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching preferencias:', error);
    throw error;
  }

  if (!data) {
    // Retornar defaults si no existen preferencias
    return { usuario_id: usuarioId, ...defaultPreferencias };
  }

  return data as PreferenciasUsuario;
}

export async function savePreferencias(preferencias: PreferenciasUsuario): Promise<PreferenciasUsuario> {
  const { id, ...dataToSave } = preferencias;

  // Intentar upsert
  const { data, error } = await segClient
    .from('preferencias_usuario')
    .upsert(dataToSave, { onConflict: 'usuario_id' })
    .select()
    .single();

  if (error) {
    console.error('Error saving preferencias:', error);
    throw error;
  }

  return data as PreferenciasUsuario;
}

export async function updateNotificaciones(
  usuarioId: string, 
  notificaciones: Partial<Pick<PreferenciasUsuario, 
    'email_notifications' | 'push_notifications' | 'desktop_notifications' | 
    'new_messages' | 'task_updates' | 'system_alerts' | 'weekly_digest'
  >>
): Promise<void> {
  const current = await getPreferencias(usuarioId);
  await savePreferencias({ ...current, ...notificaciones });
}

export async function updateRegional(
  usuarioId: string,
  regional: Partial<Pick<PreferenciasUsuario, 'idioma' | 'zona_horaria' | 'formato_fecha' | 'densidad_ui' | 'tema'>>
): Promise<void> {
  const current = await getPreferencias(usuarioId);
  await savePreferencias({ ...current, ...regional });
}

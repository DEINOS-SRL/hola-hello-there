-- Crear tabla de preferencias de usuario en el schema seg
CREATE TABLE seg.preferencias_usuario (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  -- Preferencias de notificaciones
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT false,
  desktop_notifications BOOLEAN DEFAULT true,
  new_messages BOOLEAN DEFAULT true,
  task_updates BOOLEAN DEFAULT true,
  system_alerts BOOLEAN DEFAULT true,
  weekly_digest BOOLEAN DEFAULT false,
  -- Preferencias regionales
  idioma VARCHAR(10) DEFAULT 'es',
  zona_horaria VARCHAR(50) DEFAULT 'America/Buenos_Aires',
  formato_fecha VARCHAR(20) DEFAULT 'dd/MM/yyyy',
  densidad_ui VARCHAR(20) DEFAULT 'comfortable',
  tema VARCHAR(20) DEFAULT 'system',
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  -- Constraints
  UNIQUE(usuario_id)
);

-- Enable RLS
ALTER TABLE seg.preferencias_usuario ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: cada usuario solo puede ver/modificar sus propias preferencias
CREATE POLICY "Usuarios pueden ver sus preferencias" 
ON seg.preferencias_usuario 
FOR SELECT 
USING (
  usuario_id IN (
    SELECT id FROM seg.usuarios WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuarios pueden insertar sus preferencias" 
ON seg.preferencias_usuario 
FOR INSERT 
WITH CHECK (
  usuario_id IN (
    SELECT id FROM seg.usuarios WHERE email = auth.jwt() ->> 'email'
  )
);

CREATE POLICY "Usuarios pueden actualizar sus preferencias" 
ON seg.preferencias_usuario 
FOR UPDATE 
USING (
  usuario_id IN (
    SELECT id FROM seg.usuarios WHERE email = auth.jwt() ->> 'email'
  )
);

-- Trigger para updated_at
CREATE TRIGGER update_preferencias_usuario_updated_at
BEFORE UPDATE ON seg.preferencias_usuario
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Grants
GRANT USAGE ON SCHEMA seg TO anon, authenticated;
GRANT ALL ON seg.preferencias_usuario TO anon, authenticated;
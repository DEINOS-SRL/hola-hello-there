-- Tabla de configuración de recordatorio de parte diario por usuario
CREATE TABLE rrhh.usuarios_config_partes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  usuario_id UUID NOT NULL,
  empresa_id UUID NOT NULL,
  recordatorio_activo BOOLEAN NOT NULL DEFAULT true,
  hora_recordatorio TIME NOT NULL DEFAULT '18:00:00',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(usuario_id)
);

-- Índices
CREATE INDEX idx_usuarios_config_partes_usuario ON rrhh.usuarios_config_partes(usuario_id);
CREATE INDEX idx_usuarios_config_partes_empresa ON rrhh.usuarios_config_partes(empresa_id);

-- RLS
ALTER TABLE rrhh.usuarios_config_partes ENABLE ROW LEVEL SECURITY;

-- Políticas: usuarios pueden ver y modificar solo su propia configuración
CREATE POLICY "Usuarios pueden ver su propia configuración"
ON rrhh.usuarios_config_partes
FOR SELECT
USING (usuario_id = public.get_current_usuario_id());

CREATE POLICY "Usuarios pueden crear su propia configuración"
ON rrhh.usuarios_config_partes
FOR INSERT
WITH CHECK (usuario_id = public.get_current_usuario_id());

CREATE POLICY "Usuarios pueden actualizar su propia configuración"
ON rrhh.usuarios_config_partes
FOR UPDATE
USING (usuario_id = public.get_current_usuario_id());

-- Trigger para updated_at
CREATE TRIGGER update_usuarios_config_partes_updated_at
BEFORE UPDATE ON rrhh.usuarios_config_partes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();
-- Crear tabla de feedbacks en el schema seg
CREATE TABLE seg.feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  usuario_id UUID NOT NULL,
  usuario_email VARCHAR(255),
  usuario_nombre VARCHAR(255),
  tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('sugerencia', 'mejora', 'queja', 'bug', 'consulta', 'ayuda', 'acceso-permiso')),
  mensaje TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'en_revision', 'resuelto', 'cerrado')),
  respuesta TEXT,
  respondido_por UUID,
  respondido_at TIMESTAMP WITH TIME ZONE,
  empresa_id UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Comentarios descriptivos
COMMENT ON TABLE seg.feedbacks IS 'Tabla para almacenar feedbacks de usuarios (sugerencias, bugs, consultas, etc.)';
COMMENT ON COLUMN seg.feedbacks.tipo IS 'Tipo de feedback: sugerencia, mejora, queja, bug, consulta, ayuda, acceso-permiso';
COMMENT ON COLUMN seg.feedbacks.estado IS 'Estado del feedback: pendiente, en_revision, resuelto, cerrado';

-- Índices para consultas frecuentes
CREATE INDEX idx_feedbacks_usuario_id ON seg.feedbacks(usuario_id);
CREATE INDEX idx_feedbacks_tipo ON seg.feedbacks(tipo);
CREATE INDEX idx_feedbacks_estado ON seg.feedbacks(estado);
CREATE INDEX idx_feedbacks_created_at ON seg.feedbacks(created_at DESC);

-- Trigger para updated_at
CREATE TRIGGER update_feedbacks_updated_at
  BEFORE UPDATE ON seg.feedbacks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE seg.feedbacks ENABLE ROW LEVEL SECURITY;

-- Función auxiliar para verificar si usuario es admin (security definer para evitar recursión)
CREATE OR REPLACE FUNCTION seg.is_admin(user_id UUID)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = seg
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM seg.usuario_rol ur
    JOIN seg.roles r ON r.id = ur.rol_id
    WHERE ur.usuario_id = user_id
    AND (LOWER(r.nombre) LIKE '%admin%' OR LOWER(r.nombre) LIKE '%administrador%')
  )
$$;

-- Políticas RLS
-- Los usuarios autenticados pueden insertar feedbacks
CREATE POLICY "Usuarios pueden crear feedbacks"
  ON seg.feedbacks
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Los usuarios pueden ver sus propios feedbacks
CREATE POLICY "Usuarios pueden ver sus feedbacks"
  ON seg.feedbacks
  FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid() OR seg.is_admin(auth.uid()));

-- Los administradores pueden actualizar feedbacks
CREATE POLICY "Admins pueden actualizar feedbacks"
  ON seg.feedbacks
  FOR UPDATE
  TO authenticated
  USING (seg.is_admin(auth.uid()));

-- Otorgar permisos
GRANT ALL ON seg.feedbacks TO authenticated;
GRANT USAGE ON SCHEMA seg TO authenticated;
-- Crear schema rrhh si no existe
CREATE SCHEMA IF NOT EXISTS rrhh;
GRANT USAGE ON SCHEMA rrhh TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA rrhh TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA rrhh GRANT ALL ON TABLES TO anon, authenticated;

-- Enum para tipos de novedad
CREATE TYPE rrhh.tipo_novedad AS ENUM ('mejora', 'reclamo', 'incidente', 'observacion');

-- Enum para estado de novedad
CREATE TYPE rrhh.estado_novedad AS ENUM ('pendiente', 'en_revision', 'resuelto', 'descartado');

-- Tabla principal de partes diarios
CREATE TABLE rrhh.partes_diarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  empleado_id UUID NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  actividades_realizadas TEXT NOT NULL,
  estado_animo INTEGER NOT NULL CHECK (estado_animo >= 1 AND estado_animo <= 5),
  observaciones_adicionales TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(empleado_id, fecha)
);

-- Tabla de novedades del parte diario
CREATE TABLE rrhh.partes_novedades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parte_id UUID NOT NULL REFERENCES rrhh.partes_diarios(id) ON DELETE CASCADE,
  tipo rrhh.tipo_novedad NOT NULL,
  descripcion TEXT NOT NULL,
  fotos TEXT[] DEFAULT '{}',
  estado rrhh.estado_novedad NOT NULL DEFAULT 'pendiente',
  respuesta_supervisor TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Índices para búsquedas frecuentes
CREATE INDEX idx_partes_diarios_empresa ON rrhh.partes_diarios(empresa_id);
CREATE INDEX idx_partes_diarios_empleado ON rrhh.partes_diarios(empleado_id);
CREATE INDEX idx_partes_diarios_fecha ON rrhh.partes_diarios(fecha DESC);
CREATE INDEX idx_partes_novedades_parte ON rrhh.partes_novedades(parte_id);
CREATE INDEX idx_partes_novedades_tipo ON rrhh.partes_novedades(tipo);
CREATE INDEX idx_partes_novedades_estado ON rrhh.partes_novedades(estado);

-- RLS
ALTER TABLE rrhh.partes_diarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh.partes_novedades ENABLE ROW LEVEL SECURITY;

-- Políticas para partes_diarios
CREATE POLICY "Usuarios ven partes de su empresa"
ON rrhh.partes_diarios FOR SELECT
TO authenticated
USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios crean partes de su empresa"
ON rrhh.partes_diarios FOR INSERT
TO authenticated
WITH CHECK (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios actualizan sus propios partes"
ON rrhh.partes_diarios FOR UPDATE
TO authenticated
USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios eliminan sus propios partes"
ON rrhh.partes_diarios FOR DELETE
TO authenticated
USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas para partes_novedades
CREATE POLICY "Usuarios ven novedades de su empresa"
ON rrhh.partes_novedades FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM rrhh.partes_diarios pd
    WHERE pd.id = parte_id
    AND pd.empresa_id = public.get_current_user_empresa_id()
  )
);

CREATE POLICY "Usuarios crean novedades en sus partes"
ON rrhh.partes_novedades FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM rrhh.partes_diarios pd
    WHERE pd.id = parte_id
    AND pd.empresa_id = public.get_current_user_empresa_id()
  )
);

CREATE POLICY "Usuarios actualizan novedades de su empresa"
ON rrhh.partes_novedades FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM rrhh.partes_diarios pd
    WHERE pd.id = parte_id
    AND pd.empresa_id = public.get_current_user_empresa_id()
  )
);

CREATE POLICY "Usuarios eliminan novedades de su empresa"
ON rrhh.partes_novedades FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM rrhh.partes_diarios pd
    WHERE pd.id = parte_id
    AND pd.empresa_id = public.get_current_user_empresa_id()
  )
);

-- Triggers para updated_at
CREATE TRIGGER update_partes_diarios_updated_at
  BEFORE UPDATE ON rrhh.partes_diarios
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_partes_novedades_updated_at
  BEFORE UPDATE ON rrhh.partes_novedades
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Bucket para fotos de novedades
INSERT INTO storage.buckets (id, name, public) VALUES ('partes-novedades', 'partes-novedades', true);

-- Políticas de storage
CREATE POLICY "Usuarios autenticados pueden subir fotos"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'partes-novedades');

CREATE POLICY "Fotos son públicas"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'partes-novedades');

CREATE POLICY "Usuarios pueden eliminar sus fotos"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'partes-novedades');
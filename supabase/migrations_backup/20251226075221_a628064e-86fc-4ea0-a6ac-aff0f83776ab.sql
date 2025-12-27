-- Crear tabla para actividades con horarios
CREATE TABLE rrhh.partes_actividades (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  parte_id UUID NOT NULL REFERENCES rrhh.partes_diarios(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  hora_desde TIME NOT NULL,
  hora_hasta TIME NOT NULL,
  orden INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE rrhh.partes_actividades ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Usuarios pueden ver actividades de su empresa"
ON rrhh.partes_actividades
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM rrhh.partes_diarios pd
    WHERE pd.id = parte_id
    AND pd.empresa_id = public.get_current_user_empresa_id()
  )
);

CREATE POLICY "Usuarios pueden insertar actividades"
ON rrhh.partes_actividades
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM rrhh.partes_diarios pd
    WHERE pd.id = parte_id
    AND pd.empresa_id = public.get_current_user_empresa_id()
  )
);

CREATE POLICY "Usuarios pueden actualizar actividades"
ON rrhh.partes_actividades
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM rrhh.partes_diarios pd
    WHERE pd.id = parte_id
    AND pd.empresa_id = public.get_current_user_empresa_id()
  )
);

CREATE POLICY "Usuarios pueden eliminar actividades"
ON rrhh.partes_actividades
FOR DELETE
USING (
  EXISTS (
    SELECT 1 FROM rrhh.partes_diarios pd
    WHERE pd.id = parte_id
    AND pd.empresa_id = public.get_current_user_empresa_id()
  )
);

-- Grants
GRANT USAGE ON SCHEMA rrhh TO anon, authenticated;
GRANT ALL ON rrhh.partes_actividades TO anon, authenticated;
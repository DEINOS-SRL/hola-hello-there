-- Agregar columnas faltantes a seg.modulos
ALTER TABLE seg.modulos 
ADD COLUMN IF NOT EXISTS empresa_id UUID REFERENCES seg.empresas(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS codigo VARCHAR(50),
ADD COLUMN IF NOT EXISTS permisos_requeridos TEXT[] DEFAULT '{}';

-- Crear índice para empresa_id si no existe
CREATE INDEX IF NOT EXISTS idx_modulos_empresa ON seg.modulos(empresa_id);

-- Actualizar RLS para filtrar por empresa
DROP POLICY IF EXISTS "Usuarios pueden ver módulos de su empresa" ON seg.modulos;
DROP POLICY IF EXISTS "Admins pueden gestionar módulos de su empresa" ON seg.modulos;
DROP POLICY IF EXISTS "modulos_select_policy" ON seg.modulos;
DROP POLICY IF EXISTS "modulos_all_policy" ON seg.modulos;

-- Política de lectura: usuarios ven módulos de su empresa O módulos globales (sin empresa_id)
CREATE POLICY "Usuarios pueden ver módulos"
  ON seg.modulos FOR SELECT
  USING (empresa_id IS NULL OR empresa_id = public.get_current_user_empresa_id());

-- Política de gestión para admins
CREATE POLICY "Admins pueden gestionar módulos"
  ON seg.modulos FOR ALL
  USING (empresa_id IS NULL OR empresa_id = public.get_current_user_empresa_id());

-- Comentarios actualizados
COMMENT ON TABLE seg.modulos IS 'Módulos del sistema con soporte para jerarquía padre-hijo';
COMMENT ON COLUMN seg.modulos.modulo_padre_id IS 'Referencia al módulo padre para crear submódulos';
COMMENT ON COLUMN seg.modulos.permisos_requeridos IS 'Array de permisos necesarios para acceder';
COMMENT ON COLUMN seg.modulos.icono IS 'Nombre del icono de Lucide React';
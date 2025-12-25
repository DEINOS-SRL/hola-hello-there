-- 1. Renombrar tabla aplicaciones a modulos
ALTER TABLE seg.aplicaciones RENAME TO modulos;

-- 2. Renombrar columna 'activa' a 'activo' para consistencia
ALTER TABLE seg.modulos RENAME COLUMN activa TO activo;

-- 3. Agregar columna para submódulos (referencia al módulo padre)
ALTER TABLE seg.modulos ADD COLUMN modulo_padre_id UUID REFERENCES seg.modulos(id) ON DELETE SET NULL;

-- 4. Agregar columna orden para ordenar submódulos
ALTER TABLE seg.modulos ADD COLUMN orden INTEGER DEFAULT 0;

-- 5. Renombrar columna en usuario_rol
ALTER TABLE seg.usuario_rol RENAME COLUMN aplicacion_id TO modulo_id;

-- 6. Actualizar las políticas RLS
DROP POLICY IF EXISTS "Aplicaciones visibles para usuarios autenticados" ON seg.modulos;
DROP POLICY IF EXISTS "Solo admins pueden modificar aplicaciones" ON seg.modulos;

CREATE POLICY "Modulos visibles para usuarios autenticados" 
ON seg.modulos FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Usuarios autenticados pueden modificar modulos" 
ON seg.modulos FOR ALL 
TO authenticated 
USING (true)
WITH CHECK (true);

-- 7. Crear índice para búsquedas de submódulos
CREATE INDEX IF NOT EXISTS idx_modulos_padre ON seg.modulos(modulo_padre_id);

-- 8. Actualizar el módulo de Seguridad con el nombre correcto
UPDATE seg.modulos SET nombre = 'Seguridad' WHERE nombre = 'Módulo de Seguridad';
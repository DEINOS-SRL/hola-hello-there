-- Agregar campo asignado_a en feedbacks para asignar a usuarios específicos
ALTER TABLE seg.feedbacks ADD COLUMN IF NOT EXISTS asignado_a UUID REFERENCES seg.usuarios(id) ON DELETE SET NULL;
ALTER TABLE seg.feedbacks ADD COLUMN IF NOT EXISTS asignado_at TIMESTAMPTZ;
ALTER TABLE seg.feedbacks ADD COLUMN IF NOT EXISTS asignado_por UUID REFERENCES seg.usuarios(id) ON DELETE SET NULL;

-- Índice para consultas por asignado
CREATE INDEX IF NOT EXISTS idx_feedbacks_asignado_a ON seg.feedbacks(asignado_a);

-- Crear vista de usuarios para asignación (solo usuarios activos de la empresa)
CREATE OR REPLACE VIEW seg.usuarios_asignables AS
SELECT id, nombre, apellido, email, empresa_id
FROM seg.usuarios
WHERE activo = true;
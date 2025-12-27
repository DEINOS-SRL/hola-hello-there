-- Crear schema para movimientos
CREATE SCHEMA IF NOT EXISTS mov;

-- Otorgar permisos al schema
GRANT USAGE ON SCHEMA mov TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA mov TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA mov GRANT ALL ON TABLES TO anon, authenticated;

-- Crear tipo enum para estado de movimiento
CREATE TYPE mov.estado_movimiento AS ENUM ('pendiente', 'en_transito', 'completado', 'cancelado');

-- Crear tipo enum para tipo de movimiento
CREATE TYPE mov.tipo_movimiento AS ENUM ('traslado', 'prestamo', 'mantenimiento', 'baja', 'alta');

-- Tabla de movimientos
CREATE TABLE mov.movimientos (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    empresa_id UUID REFERENCES seg.empresas(id),
    equipo_descripcion TEXT NOT NULL,
    tipo mov.tipo_movimiento NOT NULL DEFAULT 'traslado',
    origen TEXT NOT NULL,
    destino TEXT NOT NULL,
    responsable_id UUID REFERENCES seg.usuarios(id),
    responsable_nombre TEXT,
    fecha_solicitud TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    fecha_programada TIMESTAMP WITH TIME ZONE,
    fecha_ejecucion TIMESTAMP WITH TIME ZONE,
    estado mov.estado_movimiento NOT NULL DEFAULT 'pendiente',
    observaciones TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para mejor rendimiento
CREATE INDEX idx_movimientos_empresa ON mov.movimientos(empresa_id);
CREATE INDEX idx_movimientos_estado ON mov.movimientos(estado);
CREATE INDEX idx_movimientos_fecha ON mov.movimientos(fecha_solicitud DESC);
CREATE INDEX idx_movimientos_responsable ON mov.movimientos(responsable_id);

-- Trigger para updated_at
CREATE TRIGGER update_movimientos_updated_at
    BEFORE UPDATE ON mov.movimientos
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE mov.movimientos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuarios autenticados pueden ver movimientos"
    ON mov.movimientos
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden crear movimientos"
    ON mov.movimientos
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Usuarios autenticados pueden actualizar movimientos"
    ON mov.movimientos
    FOR UPDATE
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden eliminar movimientos"
    ON mov.movimientos
    FOR DELETE
    TO authenticated
    USING (true);
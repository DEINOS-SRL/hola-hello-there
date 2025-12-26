-- Crear tabla de relación muchos a muchos entre movimientos y empleados (emp.empleados)
CREATE TABLE IF NOT EXISTS mov.movimientos_empleados (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movimiento_id UUID NOT NULL REFERENCES mov.movimientos(id) ON DELETE CASCADE,
  empleado_id UUID NOT NULL REFERENCES emp.empleados(id) ON DELETE CASCADE,
  rol_asignado TEXT DEFAULT 'operario',
  hora_inicio TIME,
  hora_fin TIME,
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(movimiento_id, empleado_id)
);

-- Crear tabla de relación muchos a muchos entre movimientos y equipos (equ.equipos)
CREATE TABLE IF NOT EXISTS mov.movimientos_equipos_equ (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  movimiento_id UUID NOT NULL REFERENCES mov.movimientos(id) ON DELETE CASCADE,
  equipo_id UUID NOT NULL REFERENCES equ.equipos(id) ON DELETE CASCADE,
  kilometraje_inicio NUMERIC(10,2),
  kilometraje_fin NUMERIC(10,2),
  horas_inicio NUMERIC(10,2),
  horas_fin NUMERIC(10,2),
  observaciones TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(movimiento_id, equipo_id)
);

-- Habilitar RLS en ambas tablas
ALTER TABLE mov.movimientos_empleados ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.movimientos_equipos_equ ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para movimientos_empleados (acceso basado en el movimiento)
CREATE POLICY "movimientos_empleados_select" ON mov.movimientos_empleados
  FOR SELECT USING (
    movimiento_id IN (SELECT id FROM mov.movimientos WHERE empresa_id = public.get_current_user_empresa_id())
  );

CREATE POLICY "movimientos_empleados_insert" ON mov.movimientos_empleados
  FOR INSERT WITH CHECK (
    movimiento_id IN (SELECT id FROM mov.movimientos WHERE empresa_id = public.get_current_user_empresa_id())
  );

CREATE POLICY "movimientos_empleados_update" ON mov.movimientos_empleados
  FOR UPDATE USING (
    movimiento_id IN (SELECT id FROM mov.movimientos WHERE empresa_id = public.get_current_user_empresa_id())
  );

CREATE POLICY "movimientos_empleados_delete" ON mov.movimientos_empleados
  FOR DELETE USING (
    movimiento_id IN (SELECT id FROM mov.movimientos WHERE empresa_id = public.get_current_user_empresa_id())
  );

-- Políticas RLS para movimientos_equipos_equ
CREATE POLICY "movimientos_equipos_equ_select" ON mov.movimientos_equipos_equ
  FOR SELECT USING (
    movimiento_id IN (SELECT id FROM mov.movimientos WHERE empresa_id = public.get_current_user_empresa_id())
  );

CREATE POLICY "movimientos_equipos_equ_insert" ON mov.movimientos_equipos_equ
  FOR INSERT WITH CHECK (
    movimiento_id IN (SELECT id FROM mov.movimientos WHERE empresa_id = public.get_current_user_empresa_id())
  );

CREATE POLICY "movimientos_equipos_equ_update" ON mov.movimientos_equipos_equ
  FOR UPDATE USING (
    movimiento_id IN (SELECT id FROM mov.movimientos WHERE empresa_id = public.get_current_user_empresa_id())
  );

CREATE POLICY "movimientos_equipos_equ_delete" ON mov.movimientos_equipos_equ
  FOR DELETE USING (
    movimiento_id IN (SELECT id FROM mov.movimientos WHERE empresa_id = public.get_current_user_empresa_id())
  );

-- Índices para mejorar performance de las consultas
CREATE INDEX idx_mov_empleados_movimiento ON mov.movimientos_empleados(movimiento_id);
CREATE INDEX idx_mov_empleados_empleado ON mov.movimientos_empleados(empleado_id);
CREATE INDEX idx_mov_equipos_equ_movimiento ON mov.movimientos_equipos_equ(movimiento_id);
CREATE INDEX idx_mov_equipos_equ_equipo ON mov.movimientos_equipos_equ(equipo_id);

-- Triggers para updated_at
CREATE TRIGGER update_movimientos_empleados_updated_at
  BEFORE UPDATE ON mov.movimientos_empleados
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_movimientos_equipos_equ_updated_at
  BEFORE UPDATE ON mov.movimientos_equipos_equ
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Otorgar permisos
GRANT ALL ON mov.movimientos_empleados TO anon, authenticated;
GRANT ALL ON mov.movimientos_equipos_equ TO anon, authenticated;
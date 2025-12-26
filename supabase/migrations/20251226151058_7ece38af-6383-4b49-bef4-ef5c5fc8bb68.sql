-- =====================================================
-- MÓDULO OPERACIÓN - Wizard de Movimientos (5 Steps)
-- =====================================================

-- 1. Crear tabla de clientes
CREATE TABLE mov.clientes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  razon_social TEXT,
  cuit TEXT,
  direccion TEXT,
  telefono TEXT,
  email TEXT,
  contacto_nombre TEXT,
  contacto_telefono TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Crear tabla de unidades de negocio (configurables)
CREATE TABLE mov.unidades_negocio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Crear tabla de tipos de movimiento (por unidad de negocio)
CREATE TABLE mov.tipos_movimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  unidad_negocio_id UUID REFERENCES mov.unidades_negocio(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 4. Crear tabla de subtipos de movimiento (por tipo)
CREATE TABLE mov.subtipos_movimiento (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  tipo_movimiento_id UUID REFERENCES mov.tipos_movimiento(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  descripcion TEXT,
  campos_adicionales JSONB DEFAULT '[]', -- Define campos dinámicos para el subtipo
  activo BOOLEAN DEFAULT true,
  orden INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Crear tabla de recursos de operación (equipos específicos para operación)
CREATE TABLE mov.recursos_equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  codigo TEXT NOT NULL,
  descripcion TEXT NOT NULL,
  tipo TEXT, -- vehiculo, herramienta, maquinaria, etc
  marca TEXT,
  modelo TEXT,
  patente TEXT,
  kilometraje_actual INT DEFAULT 0,
  estado TEXT DEFAULT 'disponible', -- disponible, en_uso, mantenimiento, baja
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Crear tabla de recursos operarios
CREATE TABLE mov.recursos_operarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  legajo TEXT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  dni TEXT,
  telefono TEXT,
  email TEXT,
  rol TEXT, -- operario, supervisor, coordinador
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 7. Rediseñar tabla de movimientos con todos los campos del wizard
DROP TABLE IF EXISTS mov.movimientos CASCADE;

CREATE TABLE mov.movimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  
  -- Step 1: Datos Generales (Estado: generado)
  numero_movimiento SERIAL,
  fecha_movimiento DATE NOT NULL DEFAULT CURRENT_DATE,
  cliente_id UUID REFERENCES mov.clientes(id),
  presupuesto_id UUID, -- Referencia a com.presupuestos
  asunto TEXT NOT NULL,
  ubicacion TEXT,
  solicitante TEXT,
  alcance TEXT,
  
  -- Step 2: Línea de Servicio (Estado: asignacion_recursos)
  unidad_negocio_id UUID REFERENCES mov.unidades_negocio(id),
  tipo_movimiento_id UUID REFERENCES mov.tipos_movimiento(id),
  subtipo_movimiento_id UUID REFERENCES mov.subtipos_movimiento(id),
  campos_dinamicos JSONB DEFAULT '{}', -- Valores de campos adicionales
  
  -- Step 3: Planificación (Estado: planificado)
  hora_inicio_programada TIME,
  hora_fin_programada TIME,
  supervisor_id UUID REFERENCES mov.recursos_operarios(id),
  
  -- Step 4: Ejecución (Estado: en_ejecucion)
  remito_url TEXT,
  observaciones_operario TEXT,
  fecha_envio_supervisor TIMESTAMPTZ,
  
  -- Step 5: Cierre (Estado: cierre_operativo / completado)
  validado_por UUID REFERENCES mov.recursos_operarios(id),
  fecha_validacion TIMESTAMPTZ,
  observaciones_supervisor TEXT,
  
  -- Estado del movimiento
  estado TEXT NOT NULL DEFAULT 'generado', -- generado, asignacion_recursos, planificado, en_ejecucion, cierre_operativo, completado, cancelado
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Tabla de equipos asignados al movimiento
CREATE TABLE mov.movimientos_equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movimiento_id UUID REFERENCES mov.movimientos(id) ON DELETE CASCADE NOT NULL,
  equipo_id UUID REFERENCES mov.recursos_equipos(id) NOT NULL,
  kilometraje_inicio INT,
  kilometraje_fin INT,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 9. Tabla de operarios asignados al movimiento
CREATE TABLE mov.movimientos_operarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movimiento_id UUID REFERENCES mov.movimientos(id) ON DELETE CASCADE NOT NULL,
  operario_id UUID REFERENCES mov.recursos_operarios(id) NOT NULL,
  rol_asignado TEXT DEFAULT 'operario', -- operario, lider, apoyo
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 10. Tabla de tareas de la operación (edición inline tipo excel)
CREATE TABLE mov.movimientos_tareas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movimiento_id UUID REFERENCES mov.movimientos(id) ON DELETE CASCADE NOT NULL,
  descripcion TEXT NOT NULL,
  hora_inicio TIMESTAMPTZ,
  hora_fin TIMESTAMPTZ,
  orden INT DEFAULT 0,
  completada BOOLEAN DEFAULT false,
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 11. Tabla de calificaciones de operarios (BARS 1-5 estrellas)
CREATE TABLE mov.calificaciones_operarios (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  movimiento_id UUID REFERENCES mov.movimientos(id) ON DELETE CASCADE NOT NULL,
  operario_id UUID REFERENCES mov.recursos_operarios(id) NOT NULL,
  calificacion INT NOT NULL CHECK (calificacion >= 1 AND calificacion <= 5),
  comentario TEXT,
  calificado_por UUID REFERENCES mov.recursos_operarios(id),
  fecha_calificacion TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- =====================================================
-- ÍNDICES
-- =====================================================
CREATE INDEX idx_clientes_empresa ON mov.clientes(empresa_id);
CREATE INDEX idx_unidades_negocio_empresa ON mov.unidades_negocio(empresa_id);
CREATE INDEX idx_tipos_movimiento_unidad ON mov.tipos_movimiento(unidad_negocio_id);
CREATE INDEX idx_subtipos_movimiento_tipo ON mov.subtipos_movimiento(tipo_movimiento_id);
CREATE INDEX idx_movimientos_empresa ON mov.movimientos(empresa_id);
CREATE INDEX idx_movimientos_estado ON mov.movimientos(estado);
CREATE INDEX idx_movimientos_fecha ON mov.movimientos(fecha_movimiento);
CREATE INDEX idx_recursos_equipos_empresa ON mov.recursos_equipos(empresa_id);
CREATE INDEX idx_recursos_operarios_empresa ON mov.recursos_operarios(empresa_id);

-- =====================================================
-- RLS POLICIES
-- =====================================================
ALTER TABLE mov.clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.unidades_negocio ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.tipos_movimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.subtipos_movimiento ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.recursos_equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.recursos_operarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.movimientos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.movimientos_equipos ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.movimientos_operarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.movimientos_tareas ENABLE ROW LEVEL SECURITY;
ALTER TABLE mov.calificaciones_operarios ENABLE ROW LEVEL SECURITY;

-- Políticas para clientes
CREATE POLICY "clientes_select" ON mov.clientes FOR SELECT TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "clientes_insert" ON mov.clientes FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "clientes_update" ON mov.clientes FOR UPDATE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "clientes_delete" ON mov.clientes FOR DELETE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas para unidades_negocio
CREATE POLICY "unidades_negocio_select" ON mov.unidades_negocio FOR SELECT TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "unidades_negocio_insert" ON mov.unidades_negocio FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "unidades_negocio_update" ON mov.unidades_negocio FOR UPDATE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "unidades_negocio_delete" ON mov.unidades_negocio FOR DELETE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas para tipos_movimiento
CREATE POLICY "tipos_movimiento_select" ON mov.tipos_movimiento FOR SELECT TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "tipos_movimiento_insert" ON mov.tipos_movimiento FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "tipos_movimiento_update" ON mov.tipos_movimiento FOR UPDATE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "tipos_movimiento_delete" ON mov.tipos_movimiento FOR DELETE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas para subtipos_movimiento
CREATE POLICY "subtipos_movimiento_select" ON mov.subtipos_movimiento FOR SELECT TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "subtipos_movimiento_insert" ON mov.subtipos_movimiento FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "subtipos_movimiento_update" ON mov.subtipos_movimiento FOR UPDATE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "subtipos_movimiento_delete" ON mov.subtipos_movimiento FOR DELETE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas para recursos_equipos
CREATE POLICY "recursos_equipos_select" ON mov.recursos_equipos FOR SELECT TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "recursos_equipos_insert" ON mov.recursos_equipos FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "recursos_equipos_update" ON mov.recursos_equipos FOR UPDATE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "recursos_equipos_delete" ON mov.recursos_equipos FOR DELETE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas para recursos_operarios
CREATE POLICY "recursos_operarios_select" ON mov.recursos_operarios FOR SELECT TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "recursos_operarios_insert" ON mov.recursos_operarios FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "recursos_operarios_update" ON mov.recursos_operarios FOR UPDATE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "recursos_operarios_delete" ON mov.recursos_operarios FOR DELETE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas para movimientos
CREATE POLICY "movimientos_select" ON mov.movimientos FOR SELECT TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "movimientos_insert" ON mov.movimientos FOR INSERT TO authenticated
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "movimientos_update" ON mov.movimientos FOR UPDATE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());
CREATE POLICY "movimientos_delete" ON mov.movimientos FOR DELETE TO authenticated
  USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas para movimientos_equipos (basado en movimiento)
CREATE POLICY "movimientos_equipos_select" ON mov.movimientos_equipos FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "movimientos_equipos_insert" ON mov.movimientos_equipos FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "movimientos_equipos_update" ON mov.movimientos_equipos FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "movimientos_equipos_delete" ON mov.movimientos_equipos FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));

-- Políticas para movimientos_operarios
CREATE POLICY "movimientos_operarios_select" ON mov.movimientos_operarios FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "movimientos_operarios_insert" ON mov.movimientos_operarios FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "movimientos_operarios_update" ON mov.movimientos_operarios FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "movimientos_operarios_delete" ON mov.movimientos_operarios FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));

-- Políticas para movimientos_tareas
CREATE POLICY "movimientos_tareas_select" ON mov.movimientos_tareas FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "movimientos_tareas_insert" ON mov.movimientos_tareas FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "movimientos_tareas_update" ON mov.movimientos_tareas FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "movimientos_tareas_delete" ON mov.movimientos_tareas FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));

-- Políticas para calificaciones_operarios
CREATE POLICY "calificaciones_operarios_select" ON mov.calificaciones_operarios FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "calificaciones_operarios_insert" ON mov.calificaciones_operarios FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "calificaciones_operarios_update" ON mov.calificaciones_operarios FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));
CREATE POLICY "calificaciones_operarios_delete" ON mov.calificaciones_operarios FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM mov.movimientos m WHERE m.id = movimiento_id AND m.empresa_id = public.get_current_user_empresa_id()));

-- =====================================================
-- TRIGGERS PARA updated_at
-- =====================================================
CREATE TRIGGER update_clientes_updated_at BEFORE UPDATE ON mov.clientes
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_unidades_negocio_updated_at BEFORE UPDATE ON mov.unidades_negocio
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_tipos_movimiento_updated_at BEFORE UPDATE ON mov.tipos_movimiento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_subtipos_movimiento_updated_at BEFORE UPDATE ON mov.subtipos_movimiento
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recursos_equipos_updated_at BEFORE UPDATE ON mov.recursos_equipos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_recursos_operarios_updated_at BEFORE UPDATE ON mov.recursos_operarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_movimientos_updated_at BEFORE UPDATE ON mov.movimientos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_movimientos_tareas_updated_at BEFORE UPDATE ON mov.movimientos_tareas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PERMISOS
-- =====================================================
GRANT USAGE ON SCHEMA mov TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA mov TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA mov TO anon, authenticated;
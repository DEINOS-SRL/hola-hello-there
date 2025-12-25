-- Crear schema para módulo Comercial
CREATE SCHEMA IF NOT EXISTS com;

-- Otorgar permisos
GRANT USAGE ON SCHEMA com TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA com TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA com TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA com GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA com GRANT ALL ON SEQUENCES TO anon, authenticated;

-- Enum para estados de presupuesto
CREATE TYPE com.estado_presupuesto AS ENUM ('borrador', 'enviado', 'aprobado', 'rechazado', 'vencido');

-- Enum para estados de certificación
CREATE TYPE com.estado_certificacion AS ENUM ('pendiente', 'emitida', 'cobrada', 'anulada');

-- Enum para tipos de seguimiento
CREATE TYPE com.tipo_seguimiento AS ENUM ('llamada', 'email', 'reunion', 'visita', 'otro');

-- Tabla de Presupuestos
CREATE TABLE com.presupuestos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  numero VARCHAR(50) NOT NULL,
  cliente VARCHAR(255) NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_vencimiento DATE,
  monto_total DECIMAL(15,2) DEFAULT 0,
  estado com.estado_presupuesto DEFAULT 'borrador',
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  UNIQUE(empresa_id, numero)
);

-- Tabla de items de presupuesto
CREATE TABLE com.presupuesto_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  presupuesto_id UUID NOT NULL REFERENCES com.presupuestos(id) ON DELETE CASCADE,
  descripcion TEXT NOT NULL,
  cantidad DECIMAL(10,2) DEFAULT 1,
  precio_unitario DECIMAL(15,2) DEFAULT 0,
  subtotal DECIMAL(15,2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
  orden INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabla de Certificaciones
CREATE TABLE com.certificaciones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  presupuesto_id UUID REFERENCES com.presupuestos(id) ON DELETE SET NULL,
  numero VARCHAR(50) NOT NULL,
  descripcion TEXT,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  periodo VARCHAR(100),
  monto DECIMAL(15,2) DEFAULT 0,
  estado com.estado_certificacion DEFAULT 'pendiente',
  observaciones TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID,
  UNIQUE(empresa_id, numero)
);

-- Tabla de Seguimientos
CREATE TABLE com.seguimientos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  presupuesto_id UUID REFERENCES com.presupuestos(id) ON DELETE SET NULL,
  tipo com.tipo_seguimiento NOT NULL DEFAULT 'llamada',
  cliente VARCHAR(255),
  descripcion TEXT NOT NULL,
  fecha TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  responsable VARCHAR(255),
  resultado TEXT,
  proxima_accion TEXT,
  fecha_proxima DATE,
  completado BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID
);

-- Habilitar RLS
ALTER TABLE com.presupuestos ENABLE ROW LEVEL SECURITY;
ALTER TABLE com.presupuesto_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE com.certificaciones ENABLE ROW LEVEL SECURITY;
ALTER TABLE com.seguimientos ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para Presupuestos
CREATE POLICY "Usuarios pueden ver presupuestos de su empresa"
  ON com.presupuestos FOR SELECT
  USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden crear presupuestos en su empresa"
  ON com.presupuestos FOR INSERT
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden actualizar presupuestos de su empresa"
  ON com.presupuestos FOR UPDATE
  USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden eliminar presupuestos de su empresa"
  ON com.presupuestos FOR DELETE
  USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas RLS para Items de Presupuesto
CREATE POLICY "Usuarios pueden ver items de presupuestos de su empresa"
  ON com.presupuesto_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM com.presupuestos p 
    WHERE p.id = presupuesto_id AND p.empresa_id = public.get_current_user_empresa_id()
  ));

CREATE POLICY "Usuarios pueden crear items en presupuestos de su empresa"
  ON com.presupuesto_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM com.presupuestos p 
    WHERE p.id = presupuesto_id AND p.empresa_id = public.get_current_user_empresa_id()
  ));

CREATE POLICY "Usuarios pueden actualizar items de presupuestos de su empresa"
  ON com.presupuesto_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM com.presupuestos p 
    WHERE p.id = presupuesto_id AND p.empresa_id = public.get_current_user_empresa_id()
  ));

CREATE POLICY "Usuarios pueden eliminar items de presupuestos de su empresa"
  ON com.presupuesto_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM com.presupuestos p 
    WHERE p.id = presupuesto_id AND p.empresa_id = public.get_current_user_empresa_id()
  ));

-- Políticas RLS para Certificaciones
CREATE POLICY "Usuarios pueden ver certificaciones de su empresa"
  ON com.certificaciones FOR SELECT
  USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden crear certificaciones en su empresa"
  ON com.certificaciones FOR INSERT
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden actualizar certificaciones de su empresa"
  ON com.certificaciones FOR UPDATE
  USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden eliminar certificaciones de su empresa"
  ON com.certificaciones FOR DELETE
  USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas RLS para Seguimientos
CREATE POLICY "Usuarios pueden ver seguimientos de su empresa"
  ON com.seguimientos FOR SELECT
  USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden crear seguimientos en su empresa"
  ON com.seguimientos FOR INSERT
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden actualizar seguimientos de su empresa"
  ON com.seguimientos FOR UPDATE
  USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios pueden eliminar seguimientos de su empresa"
  ON com.seguimientos FOR DELETE
  USING (empresa_id = public.get_current_user_empresa_id());

-- Trigger para updated_at
CREATE TRIGGER update_presupuestos_updated_at
  BEFORE UPDATE ON com.presupuestos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_certificaciones_updated_at
  BEFORE UPDATE ON com.certificaciones
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_seguimientos_updated_at
  BEFORE UPDATE ON com.seguimientos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Función para actualizar monto_total del presupuesto automáticamente
CREATE OR REPLACE FUNCTION com.actualizar_monto_presupuesto()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE com.presupuestos
  SET monto_total = (
    SELECT COALESCE(SUM(subtotal), 0)
    FROM com.presupuesto_items
    WHERE presupuesto_id = COALESCE(NEW.presupuesto_id, OLD.presupuesto_id)
  )
  WHERE id = COALESCE(NEW.presupuesto_id, OLD.presupuesto_id);
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = com;

CREATE TRIGGER actualizar_monto_presupuesto_insert
  AFTER INSERT ON com.presupuesto_items
  FOR EACH ROW EXECUTE FUNCTION com.actualizar_monto_presupuesto();

CREATE TRIGGER actualizar_monto_presupuesto_update
  AFTER UPDATE ON com.presupuesto_items
  FOR EACH ROW EXECUTE FUNCTION com.actualizar_monto_presupuesto();

CREATE TRIGGER actualizar_monto_presupuesto_delete
  AFTER DELETE ON com.presupuesto_items
  FOR EACH ROW EXECUTE FUNCTION com.actualizar_monto_presupuesto();

-- Índices para mejor rendimiento
CREATE INDEX idx_presupuestos_empresa ON com.presupuestos(empresa_id);
CREATE INDEX idx_presupuestos_estado ON com.presupuestos(estado);
CREATE INDEX idx_presupuestos_fecha ON com.presupuestos(fecha DESC);
CREATE INDEX idx_certificaciones_empresa ON com.certificaciones(empresa_id);
CREATE INDEX idx_certificaciones_presupuesto ON com.certificaciones(presupuesto_id);
CREATE INDEX idx_seguimientos_empresa ON com.seguimientos(empresa_id);
CREATE INDEX idx_seguimientos_presupuesto ON com.seguimientos(presupuesto_id);
CREATE INDEX idx_seguimientos_fecha ON com.seguimientos(fecha DESC);
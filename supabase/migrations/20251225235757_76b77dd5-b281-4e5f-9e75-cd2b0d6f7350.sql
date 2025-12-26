
-- Crear schema equ para Equipos
CREATE SCHEMA IF NOT EXISTS equ;
GRANT USAGE ON SCHEMA equ TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA equ TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA equ GRANT ALL ON TABLES TO anon, authenticated;

-- Enum para estado de equipo
CREATE TYPE equ.estado_equipo AS ENUM ('activo', 'inactivo', 'mantenimiento', 'baja');

-- Tabla de tipos de equipo
CREATE TABLE equ.tipos_equipo (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nombre)
);

-- Tabla de marcas
CREATE TABLE equ.marcas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, nombre)
);

-- Tabla de modelos
CREATE TABLE equ.modelos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  marca_id UUID NOT NULL REFERENCES equ.marcas(id) ON DELETE CASCADE,
  nombre VARCHAR(100) NOT NULL,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, marca_id, nombre)
);

-- Tabla principal de equipos
CREATE TABLE equ.equipos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL,
  codigo VARCHAR(50) NOT NULL,
  nombre VARCHAR(200) NOT NULL,
  descripcion TEXT,
  tipo_equipo_id UUID REFERENCES equ.tipos_equipo(id) ON DELETE SET NULL,
  marca_id UUID REFERENCES equ.marcas(id) ON DELETE SET NULL,
  modelo_id UUID REFERENCES equ.modelos(id) ON DELETE SET NULL,
  numero_serie VARCHAR(100),
  numero_interno VARCHAR(50),
  anio_fabricacion INTEGER,
  fecha_adquisicion DATE,
  valor_adquisicion DECIMAL(15,2),
  estado equ.estado_equipo DEFAULT 'activo',
  ubicacion VARCHAR(200),
  observaciones TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(empresa_id, codigo)
);

-- Habilitar RLS en todas las tablas
ALTER TABLE equ.tipos_equipo ENABLE ROW LEVEL SECURITY;
ALTER TABLE equ.marcas ENABLE ROW LEVEL SECURITY;
ALTER TABLE equ.modelos ENABLE ROW LEVEL SECURITY;
ALTER TABLE equ.equipos ENABLE ROW LEVEL SECURITY;

-- Policies para tipos_equipo
CREATE POLICY "tipos_equipo_select" ON equ.tipos_equipo
  FOR SELECT USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "tipos_equipo_insert" ON equ.tipos_equipo
  FOR INSERT WITH CHECK (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "tipos_equipo_update" ON equ.tipos_equipo
  FOR UPDATE USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "tipos_equipo_delete" ON equ.tipos_equipo
  FOR DELETE USING (empresa_id = public.get_current_user_empresa_id());

-- Policies para marcas
CREATE POLICY "marcas_select" ON equ.marcas
  FOR SELECT USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "marcas_insert" ON equ.marcas
  FOR INSERT WITH CHECK (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "marcas_update" ON equ.marcas
  FOR UPDATE USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "marcas_delete" ON equ.marcas
  FOR DELETE USING (empresa_id = public.get_current_user_empresa_id());

-- Policies para modelos
CREATE POLICY "modelos_select" ON equ.modelos
  FOR SELECT USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "modelos_insert" ON equ.modelos
  FOR INSERT WITH CHECK (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "modelos_update" ON equ.modelos
  FOR UPDATE USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "modelos_delete" ON equ.modelos
  FOR DELETE USING (empresa_id = public.get_current_user_empresa_id());

-- Policies para equipos
CREATE POLICY "equipos_select" ON equ.equipos
  FOR SELECT USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "equipos_insert" ON equ.equipos
  FOR INSERT WITH CHECK (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "equipos_update" ON equ.equipos
  FOR UPDATE USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "equipos_delete" ON equ.equipos
  FOR DELETE USING (empresa_id = public.get_current_user_empresa_id());

-- Triggers para updated_at
CREATE TRIGGER update_tipos_equipo_updated_at
  BEFORE UPDATE ON equ.tipos_equipo
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_marcas_updated_at
  BEFORE UPDATE ON equ.marcas
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_modelos_updated_at
  BEFORE UPDATE ON equ.modelos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipos_updated_at
  BEFORE UPDATE ON equ.equipos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_tipos_equipo_empresa ON equ.tipos_equipo(empresa_id);
CREATE INDEX idx_marcas_empresa ON equ.marcas(empresa_id);
CREATE INDEX idx_modelos_empresa ON equ.modelos(empresa_id);
CREATE INDEX idx_modelos_marca ON equ.modelos(marca_id);
CREATE INDEX idx_equipos_empresa ON equ.equipos(empresa_id);
CREATE INDEX idx_equipos_tipo ON equ.equipos(tipo_equipo_id);
CREATE INDEX idx_equipos_marca ON equ.equipos(marca_id);
CREATE INDEX idx_equipos_estado ON equ.equipos(estado);

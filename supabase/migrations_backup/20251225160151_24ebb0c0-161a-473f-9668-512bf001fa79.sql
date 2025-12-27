-- Crear schema para módulo Empleados
CREATE SCHEMA IF NOT EXISTS emp;

-- Crear tabla de empleados en schema emp
CREATE TABLE emp.empleados (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  empresa_id UUID NOT NULL REFERENCES public.seg_empresas(id) ON DELETE CASCADE,
  usuario_id UUID REFERENCES public.seg_usuarios(id) ON DELETE SET NULL,
  legajo VARCHAR(50),
  nombre VARCHAR(100) NOT NULL,
  apellido VARCHAR(100) NOT NULL,
  dni VARCHAR(20),
  fecha_nacimiento DATE,
  fecha_ingreso DATE,
  cargo VARCHAR(100),
  departamento VARCHAR(100),
  email VARCHAR(255),
  telefono VARCHAR(50),
  direccion TEXT,
  estado VARCHAR(20) DEFAULT 'activo' CHECK (estado IN ('activo', 'licencia', 'baja')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Índices
CREATE INDEX idx_emp_empleados_empresa ON emp.empleados(empresa_id);
CREATE INDEX idx_emp_empleados_usuario ON emp.empleados(usuario_id);
CREATE INDEX idx_emp_empleados_legajo ON emp.empleados(legajo);
CREATE INDEX idx_emp_empleados_estado ON emp.empleados(estado);

-- Trigger para updated_at
CREATE TRIGGER update_emp_empleados_updated_at
  BEFORE UPDATE ON emp.empleados
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Habilitar RLS
ALTER TABLE emp.empleados ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Usuarios ven empleados de su empresa"
  ON emp.empleados FOR SELECT
  USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios con permiso pueden insertar empleados"
  ON emp.empleados FOR INSERT
  WITH CHECK (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios con permiso pueden actualizar empleados"
  ON emp.empleados FOR UPDATE
  USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Usuarios con permiso pueden eliminar empleados"
  ON emp.empleados FOR DELETE
  USING (empresa_id = public.get_current_user_empresa_id());

-- Exponer schema emp en la API de Supabase (importante!)
GRANT USAGE ON SCHEMA emp TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA emp TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA emp TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA emp GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA emp GRANT ALL ON SEQUENCES TO anon, authenticated;
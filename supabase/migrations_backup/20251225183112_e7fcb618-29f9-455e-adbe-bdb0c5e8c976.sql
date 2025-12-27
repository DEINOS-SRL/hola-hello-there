-- Crear schema rrhh si no existe
CREATE SCHEMA IF NOT EXISTS rrhh;
GRANT USAGE ON SCHEMA rrhh TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA rrhh TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA rrhh GRANT ALL ON TABLES TO anon, authenticated;

-- Tabla de registros de asistencia (entrada/salida)
CREATE TABLE rrhh.asistencias (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  empleado_id UUID NOT NULL,
  fecha DATE NOT NULL DEFAULT CURRENT_DATE,
  hora_entrada TIMESTAMPTZ,
  hora_salida TIMESTAMPTZ,
  tipo VARCHAR(20) NOT NULL DEFAULT 'normal' CHECK (tipo IN ('normal', 'tardanza', 'falta', 'permiso', 'vacaciones', 'licencia')),
  observaciones TEXT,
  registrado_por UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(empleado_id, fecha)
);

-- Tabla de permisos/licencias
CREATE TABLE rrhh.permisos (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  empleado_id UUID NOT NULL,
  tipo VARCHAR(30) NOT NULL CHECK (tipo IN ('permiso_personal', 'licencia_medica', 'vacaciones', 'licencia_paternidad', 'licencia_maternidad', 'duelo', 'otro')),
  fecha_inicio DATE NOT NULL,
  fecha_fin DATE NOT NULL,
  dias_totales INTEGER GENERATED ALWAYS AS (fecha_fin - fecha_inicio + 1) STORED,
  motivo TEXT NOT NULL,
  estado VARCHAR(20) NOT NULL DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobado', 'rechazado', 'cancelado')),
  aprobado_por UUID,
  fecha_aprobacion TIMESTAMPTZ,
  documento_adjunto TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de horarios de trabajo
CREATE TABLE rrhh.horarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  nombre VARCHAR(100) NOT NULL,
  descripcion TEXT,
  hora_entrada TIME NOT NULL,
  hora_salida TIME NOT NULL,
  tolerancia_minutos INTEGER DEFAULT 15,
  dias_laborables VARCHAR(20)[] DEFAULT ARRAY['lunes', 'martes', 'miercoles', 'jueves', 'viernes'],
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Tabla de asignación de horarios a empleados
CREATE TABLE rrhh.empleado_horarios (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  empresa_id UUID NOT NULL,
  empleado_id UUID NOT NULL,
  horario_id UUID NOT NULL REFERENCES rrhh.horarios(id) ON DELETE CASCADE,
  fecha_inicio DATE NOT NULL DEFAULT CURRENT_DATE,
  fecha_fin DATE,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE rrhh.asistencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh.permisos ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh.horarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE rrhh.empleado_horarios ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para asistencias
CREATE POLICY "Users can view asistencias from their empresa" ON rrhh.asistencias
  FOR SELECT USING (empresa_id = public.get_current_user_empresa_id());
  
CREATE POLICY "Users can insert asistencias for their empresa" ON rrhh.asistencias
  FOR INSERT WITH CHECK (empresa_id = public.get_current_user_empresa_id());
  
CREATE POLICY "Users can update asistencias from their empresa" ON rrhh.asistencias
  FOR UPDATE USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Users can delete asistencias from their empresa" ON rrhh.asistencias
  FOR DELETE USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas RLS para permisos
CREATE POLICY "Users can view permisos from their empresa" ON rrhh.permisos
  FOR SELECT USING (empresa_id = public.get_current_user_empresa_id());
  
CREATE POLICY "Users can insert permisos for their empresa" ON rrhh.permisos
  FOR INSERT WITH CHECK (empresa_id = public.get_current_user_empresa_id());
  
CREATE POLICY "Users can update permisos from their empresa" ON rrhh.permisos
  FOR UPDATE USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Users can delete permisos from their empresa" ON rrhh.permisos
  FOR DELETE USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas RLS para horarios
CREATE POLICY "Users can view horarios from their empresa" ON rrhh.horarios
  FOR SELECT USING (empresa_id = public.get_current_user_empresa_id());
  
CREATE POLICY "Users can insert horarios for their empresa" ON rrhh.horarios
  FOR INSERT WITH CHECK (empresa_id = public.get_current_user_empresa_id());
  
CREATE POLICY "Users can update horarios from their empresa" ON rrhh.horarios
  FOR UPDATE USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Users can delete horarios from their empresa" ON rrhh.horarios
  FOR DELETE USING (empresa_id = public.get_current_user_empresa_id());

-- Políticas RLS para empleado_horarios
CREATE POLICY "Users can view empleado_horarios from their empresa" ON rrhh.empleado_horarios
  FOR SELECT USING (empresa_id = public.get_current_user_empresa_id());
  
CREATE POLICY "Users can insert empleado_horarios for their empresa" ON rrhh.empleado_horarios
  FOR INSERT WITH CHECK (empresa_id = public.get_current_user_empresa_id());
  
CREATE POLICY "Users can update empleado_horarios from their empresa" ON rrhh.empleado_horarios
  FOR UPDATE USING (empresa_id = public.get_current_user_empresa_id());

CREATE POLICY "Users can delete empleado_horarios from their empresa" ON rrhh.empleado_horarios
  FOR DELETE USING (empresa_id = public.get_current_user_empresa_id());

-- Triggers para updated_at
CREATE TRIGGER update_asistencias_updated_at
  BEFORE UPDATE ON rrhh.asistencias
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_permisos_updated_at
  BEFORE UPDATE ON rrhh.permisos
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_horarios_updated_at
  BEFORE UPDATE ON rrhh.horarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_empleado_horarios_updated_at
  BEFORE UPDATE ON rrhh.empleado_horarios
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
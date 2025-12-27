-- =============================================
-- ESQUEMA COMPLETO DE LA BASE DE DATOS
-- Exportado: 2025-12-26T23:14:47.127Z
-- Proyecto: ezchqajzxaeepwqqzmyr
-- =============================================


-- =============================================
-- ESQUEMA: COM
-- =============================================

CREATE SCHEMA IF NOT EXISTS com;

-- Tabla: com.certificaciones
CREATE TABLE IF NOT EXISTS com.certificaciones (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  presupuesto_id uuid,
  numero varchar(50) NOT NULL,
  descripcion text,
  fecha date DEFAULT CURRENT_DATE NOT NULL,
  periodo varchar(100),
  monto numeric(15,2) DEFAULT 0,
  estado estado_certificacion DEFAULT 'pendiente'::com.estado_certificacion,
  observaciones text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

ALTER TABLE com.certificaciones ADD CONSTRAINT certificaciones_empresa_id_numero_key UNIQUE (empresa_id, numero);
ALTER TABLE com.certificaciones ADD CONSTRAINT certificaciones_pkey PRIMARY KEY (id);
ALTER TABLE com.certificaciones ADD CONSTRAINT certificaciones_presupuesto_id_fkey FOREIGN KEY (presupuesto_id) REFERENCES com.presupuestos(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX certificaciones_empresa_id_numero_key ON com.certificaciones USING btree (empresa_id, numero);
CREATE INDEX idx_certificaciones_empresa ON com.certificaciones USING btree (empresa_id);
CREATE INDEX idx_certificaciones_presupuesto ON com.certificaciones USING btree (presupuesto_id);

-- Tabla: com.presupuesto_items
CREATE TABLE IF NOT EXISTS com.presupuesto_items (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  presupuesto_id uuid NOT NULL,
  descripcion text NOT NULL,
  cantidad numeric(10,2) DEFAULT 1,
  precio_unitario numeric(15,2) DEFAULT 0,
  subtotal numeric(15,2),
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE com.presupuesto_items ADD CONSTRAINT presupuesto_items_pkey PRIMARY KEY (id);
ALTER TABLE com.presupuesto_items ADD CONSTRAINT presupuesto_items_presupuesto_id_fkey FOREIGN KEY (presupuesto_id) REFERENCES com.presupuestos(id) ON DELETE CASCADE;

-- Tabla: com.presupuestos
CREATE TABLE IF NOT EXISTS com.presupuestos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  numero varchar(50) NOT NULL,
  cliente varchar(255) NOT NULL,
  descripcion text,
  fecha date DEFAULT CURRENT_DATE NOT NULL,
  fecha_vencimiento date,
  monto_total numeric(15,2) DEFAULT 0,
  estado estado_presupuesto DEFAULT 'borrador'::com.estado_presupuesto,
  observaciones text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

ALTER TABLE com.presupuestos ADD CONSTRAINT presupuestos_empresa_id_numero_key UNIQUE (empresa_id, numero);
ALTER TABLE com.presupuestos ADD CONSTRAINT presupuestos_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX presupuestos_empresa_id_numero_key ON com.presupuestos USING btree (empresa_id, numero);
CREATE INDEX idx_presupuestos_empresa ON com.presupuestos USING btree (empresa_id);
CREATE INDEX idx_presupuestos_estado ON com.presupuestos USING btree (estado);
CREATE INDEX idx_presupuestos_fecha ON com.presupuestos USING btree (fecha DESC);

-- Tabla: com.seguimientos
CREATE TABLE IF NOT EXISTS com.seguimientos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  presupuesto_id uuid,
  tipo tipo_seguimiento DEFAULT 'llamada'::com.tipo_seguimiento NOT NULL,
  cliente varchar(255),
  descripcion text NOT NULL,
  fecha timestamp with time zone DEFAULT now() NOT NULL,
  responsable varchar(255),
  resultado text,
  proxima_accion text,
  fecha_proxima date,
  completado boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  created_by uuid
);

ALTER TABLE com.seguimientos ADD CONSTRAINT seguimientos_pkey PRIMARY KEY (id);
ALTER TABLE com.seguimientos ADD CONSTRAINT seguimientos_presupuesto_id_fkey FOREIGN KEY (presupuesto_id) REFERENCES com.presupuestos(id) ON DELETE SET NULL;

CREATE INDEX idx_seguimientos_empresa ON com.seguimientos USING btree (empresa_id);
CREATE INDEX idx_seguimientos_presupuesto ON com.seguimientos USING btree (presupuesto_id);
CREATE INDEX idx_seguimientos_fecha ON com.seguimientos USING btree (fecha DESC);

-- Funciones del esquema com
CREATE OR REPLACE FUNCTION com.actualizar_monto_presupuesto()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'com'
AS $function$
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
$function$
;


-- =============================================
-- ESQUEMA: EMP
-- =============================================

CREATE SCHEMA IF NOT EXISTS emp;

-- Tabla: emp.empleados
CREATE TABLE IF NOT EXISTS emp.empleados (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  usuario_id uuid,
  legajo varchar(50),
  nombre varchar(100) NOT NULL,
  apellido varchar(100) NOT NULL,
  dni varchar(20),
  fecha_nacimiento date,
  fecha_ingreso date,
  cargo varchar(100),
  departamento varchar(100),
  email varchar(255),
  telefono varchar(50),
  direccion text,
  estado varchar(20) DEFAULT 'activo'::character varying,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE emp.empleados ADD CONSTRAINT empleados_pkey PRIMARY KEY (id);
ALTER TABLE emp.empleados ADD CONSTRAINT empleados_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES seg.empresas(id) ON DELETE CASCADE;
ALTER TABLE emp.empleados ADD CONSTRAINT empleados_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES seg.usuarios(id) ON DELETE SET NULL;
ALTER TABLE emp.empleados ADD CONSTRAINT empleados_estado_check CHECK (((estado)::text = ANY ((ARRAY['activo'::character varying, 'licencia'::character varying, 'baja'::character varying])::text[])));

CREATE INDEX idx_emp_empleados_empresa ON emp.empleados USING btree (empresa_id);
CREATE INDEX idx_emp_empleados_usuario ON emp.empleados USING btree (usuario_id);
CREATE INDEX idx_emp_empleados_legajo ON emp.empleados USING btree (legajo);
CREATE INDEX idx_emp_empleados_estado ON emp.empleados USING btree (estado);


-- =============================================
-- ESQUEMA: EQU
-- =============================================

CREATE SCHEMA IF NOT EXISTS equ;

-- Tabla: equ.equipos
CREATE TABLE IF NOT EXISTS equ.equipos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  codigo varchar(50) NOT NULL,
  nombre varchar(200) NOT NULL,
  descripcion text,
  tipo_equipo_id uuid,
  marca_id uuid,
  modelo_id uuid,
  numero_serie varchar(100),
  numero_interno varchar(50),
  anio_fabricacion integer,
  fecha_adquisicion date,
  valor_adquisicion numeric(15,2),
  estado estado_equipo DEFAULT 'activo'::equ.estado_equipo,
  ubicacion varchar(200),
  observaciones text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE equ.equipos ADD CONSTRAINT equipos_empresa_id_codigo_key UNIQUE (empresa_id, codigo);
ALTER TABLE equ.equipos ADD CONSTRAINT equipos_pkey PRIMARY KEY (id);
ALTER TABLE equ.equipos ADD CONSTRAINT equipos_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES equ.marcas(id) ON DELETE SET NULL;
ALTER TABLE equ.equipos ADD CONSTRAINT equipos_modelo_id_fkey FOREIGN KEY (modelo_id) REFERENCES equ.modelos(id) ON DELETE SET NULL;
ALTER TABLE equ.equipos ADD CONSTRAINT equipos_tipo_equipo_id_fkey FOREIGN KEY (tipo_equipo_id) REFERENCES equ.tipos_equipo(id) ON DELETE SET NULL;

CREATE UNIQUE INDEX equipos_empresa_id_codigo_key ON equ.equipos USING btree (empresa_id, codigo);
CREATE INDEX idx_equipos_empresa ON equ.equipos USING btree (empresa_id);
CREATE INDEX idx_equipos_tipo ON equ.equipos USING btree (tipo_equipo_id);
CREATE INDEX idx_equipos_marca ON equ.equipos USING btree (marca_id);
CREATE INDEX idx_equipos_estado ON equ.equipos USING btree (estado);

-- Tabla: equ.marcas
CREATE TABLE IF NOT EXISTS equ.marcas (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  nombre varchar(100) NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE equ.marcas ADD CONSTRAINT marcas_empresa_id_nombre_key UNIQUE (empresa_id, nombre);
ALTER TABLE equ.marcas ADD CONSTRAINT marcas_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX marcas_empresa_id_nombre_key ON equ.marcas USING btree (empresa_id, nombre);
CREATE INDEX idx_marcas_empresa ON equ.marcas USING btree (empresa_id);

-- Tabla: equ.modelos
CREATE TABLE IF NOT EXISTS equ.modelos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  marca_id uuid NOT NULL,
  nombre varchar(100) NOT NULL,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE equ.modelos ADD CONSTRAINT modelos_empresa_id_marca_id_nombre_key UNIQUE (empresa_id, marca_id, nombre);
ALTER TABLE equ.modelos ADD CONSTRAINT modelos_pkey PRIMARY KEY (id);
ALTER TABLE equ.modelos ADD CONSTRAINT modelos_marca_id_fkey FOREIGN KEY (marca_id) REFERENCES equ.marcas(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX modelos_empresa_id_marca_id_nombre_key ON equ.modelos USING btree (empresa_id, marca_id, nombre);
CREATE INDEX idx_modelos_empresa ON equ.modelos USING btree (empresa_id);
CREATE INDEX idx_modelos_marca ON equ.modelos USING btree (marca_id);

-- Tabla: equ.tipos_equipo
CREATE TABLE IF NOT EXISTS equ.tipos_equipo (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  nombre varchar(100) NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE equ.tipos_equipo ADD CONSTRAINT tipos_equipo_empresa_id_nombre_key UNIQUE (empresa_id, nombre);
ALTER TABLE equ.tipos_equipo ADD CONSTRAINT tipos_equipo_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX tipos_equipo_empresa_id_nombre_key ON equ.tipos_equipo USING btree (empresa_id, nombre);
CREATE INDEX idx_tipos_equipo_empresa ON equ.tipos_equipo USING btree (empresa_id);


-- =============================================
-- ESQUEMA: MOV
-- =============================================

CREATE SCHEMA IF NOT EXISTS mov;

-- Tabla: mov.calificaciones_operarios
CREATE TABLE IF NOT EXISTS mov.calificaciones_operarios (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  movimiento_id uuid NOT NULL,
  operario_id uuid NOT NULL,
  calificacion integer NOT NULL,
  comentario text,
  calificado_por uuid,
  fecha_calificacion timestamp with time zone DEFAULT now(),
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE mov.calificaciones_operarios ADD CONSTRAINT calificaciones_operarios_pkey PRIMARY KEY (id);
ALTER TABLE mov.calificaciones_operarios ADD CONSTRAINT calificaciones_operarios_movimiento_id_fkey FOREIGN KEY (movimiento_id) REFERENCES mov.movimientos(id) ON DELETE CASCADE;
ALTER TABLE mov.calificaciones_operarios ADD CONSTRAINT calificaciones_operarios_calificacion_check CHECK (((calificacion >= 1) AND (calificacion <= 5)));

-- Tabla: mov.clientes
CREATE TABLE IF NOT EXISTS mov.clientes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  nombre text NOT NULL,
  razon_social text,
  cuit text,
  direccion text,
  telefono text,
  email text,
  contacto_nombre text,
  contacto_telefono text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE mov.clientes ADD CONSTRAINT clientes_pkey PRIMARY KEY (id);

CREATE INDEX idx_clientes_empresa ON mov.clientes USING btree (empresa_id);

-- Tabla: mov.movimientos
CREATE TABLE IF NOT EXISTS mov.movimientos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  numero_movimiento integer DEFAULT nextval('mov.movimientos_numero_movimiento_seq'::regclass) NOT NULL,
  fecha_movimiento date DEFAULT CURRENT_DATE NOT NULL,
  cliente_id uuid,
  presupuesto_id uuid,
  asunto text NOT NULL,
  ubicacion text,
  solicitante text,
  alcance text,
  unidad_negocio_id uuid,
  tipo_movimiento_id uuid,
  subtipo_movimiento_id uuid,
  campos_dinamicos jsonb DEFAULT '{}'::jsonb,
  hora_inicio_programada time without time zone,
  hora_fin_programada time without time zone,
  supervisor_id uuid,
  remito_url text,
  observaciones_operario text,
  fecha_envio_supervisor timestamp with time zone,
  validado_por uuid,
  fecha_validacion timestamp with time zone,
  observaciones_supervisor text,
  estado text DEFAULT 'generado'::text NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  remitos_urls text[] DEFAULT '{}'::text[]
);

ALTER TABLE mov.movimientos ADD CONSTRAINT movimientos_pkey PRIMARY KEY (id);
ALTER TABLE mov.movimientos ADD CONSTRAINT movimientos_cliente_id_fkey FOREIGN KEY (cliente_id) REFERENCES mov.clientes(id);
ALTER TABLE mov.movimientos ADD CONSTRAINT movimientos_subtipo_movimiento_id_fkey FOREIGN KEY (subtipo_movimiento_id) REFERENCES mov.subtipos_movimiento(id);
ALTER TABLE mov.movimientos ADD CONSTRAINT movimientos_tipo_movimiento_id_fkey FOREIGN KEY (tipo_movimiento_id) REFERENCES mov.tipos_movimiento(id);
ALTER TABLE mov.movimientos ADD CONSTRAINT movimientos_unidad_negocio_id_fkey FOREIGN KEY (unidad_negocio_id) REFERENCES mov.unidades_negocio(id);

CREATE INDEX idx_movimientos_empresa ON mov.movimientos USING btree (empresa_id);
CREATE INDEX idx_movimientos_estado ON mov.movimientos USING btree (estado);
CREATE INDEX idx_movimientos_fecha ON mov.movimientos USING btree (fecha_movimiento);

-- Tabla: mov.movimientos_empleados
CREATE TABLE IF NOT EXISTS mov.movimientos_empleados (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  movimiento_id uuid NOT NULL,
  empleado_id uuid NOT NULL,
  rol_asignado text DEFAULT 'operario'::text,
  hora_inicio time without time zone,
  hora_fin time without time zone,
  observaciones text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE mov.movimientos_empleados ADD CONSTRAINT movimientos_empleados_movimiento_id_empleado_id_key UNIQUE (movimiento_id, empleado_id);
ALTER TABLE mov.movimientos_empleados ADD CONSTRAINT movimientos_empleados_pkey PRIMARY KEY (id);
ALTER TABLE mov.movimientos_empleados ADD CONSTRAINT movimientos_empleados_empleado_id_fkey FOREIGN KEY (empleado_id) REFERENCES emp.empleados(id) ON DELETE CASCADE;
ALTER TABLE mov.movimientos_empleados ADD CONSTRAINT movimientos_empleados_movimiento_id_fkey FOREIGN KEY (movimiento_id) REFERENCES mov.movimientos(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX movimientos_empleados_movimiento_id_empleado_id_key ON mov.movimientos_empleados USING btree (movimiento_id, empleado_id);
CREATE INDEX idx_mov_empleados_movimiento ON mov.movimientos_empleados USING btree (movimiento_id);
CREATE INDEX idx_mov_empleados_empleado ON mov.movimientos_empleados USING btree (empleado_id);

-- Tabla: mov.movimientos_equipos_equ
CREATE TABLE IF NOT EXISTS mov.movimientos_equipos_equ (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  movimiento_id uuid NOT NULL,
  equipo_id uuid NOT NULL,
  kilometraje_inicio numeric(10,2),
  kilometraje_fin numeric(10,2),
  horas_inicio numeric(10,2),
  horas_fin numeric(10,2),
  observaciones text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE mov.movimientos_equipos_equ ADD CONSTRAINT movimientos_equipos_equ_movimiento_id_equipo_id_key UNIQUE (movimiento_id, equipo_id);
ALTER TABLE mov.movimientos_equipos_equ ADD CONSTRAINT movimientos_equipos_equ_pkey PRIMARY KEY (id);
ALTER TABLE mov.movimientos_equipos_equ ADD CONSTRAINT movimientos_equipos_equ_equipo_id_fkey FOREIGN KEY (equipo_id) REFERENCES equ.equipos(id) ON DELETE CASCADE;
ALTER TABLE mov.movimientos_equipos_equ ADD CONSTRAINT movimientos_equipos_equ_movimiento_id_fkey FOREIGN KEY (movimiento_id) REFERENCES mov.movimientos(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX movimientos_equipos_equ_movimiento_id_equipo_id_key ON mov.movimientos_equipos_equ USING btree (movimiento_id, equipo_id);
CREATE INDEX idx_mov_equipos_equ_movimiento ON mov.movimientos_equipos_equ USING btree (movimiento_id);
CREATE INDEX idx_mov_equipos_equ_equipo ON mov.movimientos_equipos_equ USING btree (equipo_id);

-- Tabla: mov.movimientos_tareas
CREATE TABLE IF NOT EXISTS mov.movimientos_tareas (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  movimiento_id uuid NOT NULL,
  descripcion text NOT NULL,
  hora_inicio timestamp with time zone,
  hora_fin timestamp with time zone,
  orden integer DEFAULT 0,
  completada boolean DEFAULT false,
  observaciones text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE mov.movimientos_tareas ADD CONSTRAINT movimientos_tareas_pkey PRIMARY KEY (id);
ALTER TABLE mov.movimientos_tareas ADD CONSTRAINT movimientos_tareas_movimiento_id_fkey FOREIGN KEY (movimiento_id) REFERENCES mov.movimientos(id) ON DELETE CASCADE;

-- Tabla: mov.subtipos_movimiento
CREATE TABLE IF NOT EXISTS mov.subtipos_movimiento (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  tipo_movimiento_id uuid,
  nombre text NOT NULL,
  descripcion text,
  campos_adicionales jsonb DEFAULT '[]'::jsonb,
  activo boolean DEFAULT true,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE mov.subtipos_movimiento ADD CONSTRAINT subtipos_movimiento_pkey PRIMARY KEY (id);
ALTER TABLE mov.subtipos_movimiento ADD CONSTRAINT subtipos_movimiento_tipo_movimiento_id_fkey FOREIGN KEY (tipo_movimiento_id) REFERENCES mov.tipos_movimiento(id) ON DELETE CASCADE;

CREATE INDEX idx_subtipos_movimiento_tipo ON mov.subtipos_movimiento USING btree (tipo_movimiento_id);

-- Tabla: mov.tipos_movimiento
CREATE TABLE IF NOT EXISTS mov.tipos_movimiento (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  unidad_negocio_id uuid,
  nombre text NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE mov.tipos_movimiento ADD CONSTRAINT tipos_movimiento_pkey PRIMARY KEY (id);
ALTER TABLE mov.tipos_movimiento ADD CONSTRAINT tipos_movimiento_unidad_negocio_id_fkey FOREIGN KEY (unidad_negocio_id) REFERENCES mov.unidades_negocio(id) ON DELETE CASCADE;

CREATE INDEX idx_tipos_movimiento_unidad ON mov.tipos_movimiento USING btree (unidad_negocio_id);

-- Tabla: mov.unidades_negocio
CREATE TABLE IF NOT EXISTS mov.unidades_negocio (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  nombre text NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE mov.unidades_negocio ADD CONSTRAINT unidades_negocio_pkey PRIMARY KEY (id);

CREATE INDEX idx_unidades_negocio_empresa ON mov.unidades_negocio USING btree (empresa_id);


-- =============================================
-- ESQUEMA: RRHH
-- =============================================

CREATE SCHEMA IF NOT EXISTS rrhh;

-- Tabla: rrhh.asistencias
CREATE TABLE IF NOT EXISTS rrhh.asistencias (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  empleado_id uuid NOT NULL,
  fecha date DEFAULT CURRENT_DATE NOT NULL,
  hora_entrada timestamp with time zone,
  hora_salida timestamp with time zone,
  tipo varchar(20) DEFAULT 'normal'::character varying NOT NULL,
  observaciones text,
  registrado_por uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE rrhh.asistencias ADD CONSTRAINT asistencias_empleado_id_fecha_key UNIQUE (empleado_id, fecha);
ALTER TABLE rrhh.asistencias ADD CONSTRAINT asistencias_pkey PRIMARY KEY (id);
ALTER TABLE rrhh.asistencias ADD CONSTRAINT asistencias_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['normal'::character varying, 'tardanza'::character varying, 'falta'::character varying, 'permiso'::character varying, 'vacaciones'::character varying, 'licencia'::character varying])::text[])));

CREATE UNIQUE INDEX asistencias_empleado_id_fecha_key ON rrhh.asistencias USING btree (empleado_id, fecha);

-- Tabla: rrhh.empleado_horarios
CREATE TABLE IF NOT EXISTS rrhh.empleado_horarios (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  empleado_id uuid NOT NULL,
  horario_id uuid NOT NULL,
  fecha_inicio date DEFAULT CURRENT_DATE NOT NULL,
  fecha_fin date,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE rrhh.empleado_horarios ADD CONSTRAINT empleado_horarios_pkey PRIMARY KEY (id);
ALTER TABLE rrhh.empleado_horarios ADD CONSTRAINT empleado_horarios_horario_id_fkey FOREIGN KEY (horario_id) REFERENCES rrhh.horarios(id) ON DELETE CASCADE;

-- Tabla: rrhh.horarios
CREATE TABLE IF NOT EXISTS rrhh.horarios (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  nombre varchar(100) NOT NULL,
  descripcion text,
  hora_entrada time without time zone NOT NULL,
  hora_salida time without time zone NOT NULL,
  tolerancia_minutos integer DEFAULT 15,
  dias_laborables varchar[] DEFAULT ARRAY['lunes'::text, 'martes'::text, 'miercoles'::text, 'jueves'::text, 'viernes'::text],
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE rrhh.horarios ADD CONSTRAINT horarios_pkey PRIMARY KEY (id);

-- Tabla: rrhh.partes_actividades
CREATE TABLE IF NOT EXISTS rrhh.partes_actividades (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  parte_id uuid NOT NULL,
  descripcion text NOT NULL,
  hora_desde time without time zone NOT NULL,
  hora_hasta time without time zone NOT NULL,
  orden integer DEFAULT 0 NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE rrhh.partes_actividades ADD CONSTRAINT partes_actividades_pkey PRIMARY KEY (id);
ALTER TABLE rrhh.partes_actividades ADD CONSTRAINT partes_actividades_parte_id_fkey FOREIGN KEY (parte_id) REFERENCES rrhh.partes_diarios(id) ON DELETE CASCADE;

-- Tabla: rrhh.partes_diarios
CREATE TABLE IF NOT EXISTS rrhh.partes_diarios (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  empleado_id uuid NOT NULL,
  fecha date DEFAULT CURRENT_DATE NOT NULL,
  actividades_realizadas text NOT NULL,
  estado_animo integer NOT NULL,
  observaciones_adicionales text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE rrhh.partes_diarios ADD CONSTRAINT partes_diarios_empleado_id_fecha_key UNIQUE (empleado_id, fecha);
ALTER TABLE rrhh.partes_diarios ADD CONSTRAINT partes_diarios_pkey PRIMARY KEY (id);
ALTER TABLE rrhh.partes_diarios ADD CONSTRAINT partes_diarios_estado_animo_check CHECK (((estado_animo >= 1) AND (estado_animo <= 5)));

CREATE UNIQUE INDEX partes_diarios_empleado_id_fecha_key ON rrhh.partes_diarios USING btree (empleado_id, fecha);
CREATE INDEX idx_partes_diarios_empresa ON rrhh.partes_diarios USING btree (empresa_id);
CREATE INDEX idx_partes_diarios_empleado ON rrhh.partes_diarios USING btree (empleado_id);
CREATE INDEX idx_partes_diarios_fecha ON rrhh.partes_diarios USING btree (fecha DESC);

-- Tabla: rrhh.partes_novedades
CREATE TABLE IF NOT EXISTS rrhh.partes_novedades (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  parte_id uuid NOT NULL,
  tipo tipo_novedad NOT NULL,
  descripcion text NOT NULL,
  fotos text[] DEFAULT '{}'::text[],
  estado estado_novedad DEFAULT 'pendiente'::rrhh.estado_novedad NOT NULL,
  respuesta_supervisor text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE rrhh.partes_novedades ADD CONSTRAINT partes_novedades_pkey PRIMARY KEY (id);
ALTER TABLE rrhh.partes_novedades ADD CONSTRAINT partes_novedades_parte_id_fkey FOREIGN KEY (parte_id) REFERENCES rrhh.partes_diarios(id) ON DELETE CASCADE;

CREATE INDEX idx_partes_novedades_parte ON rrhh.partes_novedades USING btree (parte_id);
CREATE INDEX idx_partes_novedades_tipo ON rrhh.partes_novedades USING btree (tipo);
CREATE INDEX idx_partes_novedades_estado ON rrhh.partes_novedades USING btree (estado);

-- Tabla: rrhh.permisos
CREATE TABLE IF NOT EXISTS rrhh.permisos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  empleado_id uuid NOT NULL,
  tipo varchar(30) NOT NULL,
  fecha_inicio date NOT NULL,
  fecha_fin date NOT NULL,
  dias_totales integer,
  motivo text NOT NULL,
  estado varchar(20) DEFAULT 'pendiente'::character varying NOT NULL,
  aprobado_por uuid,
  fecha_aprobacion timestamp with time zone,
  documento_adjunto text,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE rrhh.permisos ADD CONSTRAINT permisos_pkey PRIMARY KEY (id);
ALTER TABLE rrhh.permisos ADD CONSTRAINT permisos_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'aprobado'::character varying, 'rechazado'::character varying, 'cancelado'::character varying])::text[])));
ALTER TABLE rrhh.permisos ADD CONSTRAINT permisos_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['permiso_personal'::character varying, 'licencia_medica'::character varying, 'vacaciones'::character varying, 'licencia_paternidad'::character varying, 'licencia_maternidad'::character varying, 'duelo'::character varying, 'otro'::character varying])::text[])));

-- Tabla: rrhh.usuarios_config_partes
CREATE TABLE IF NOT EXISTS rrhh.usuarios_config_partes (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  usuario_id uuid NOT NULL,
  empresa_id uuid NOT NULL,
  recordatorio_activo boolean DEFAULT true NOT NULL,
  hora_recordatorio time without time zone DEFAULT '18:00:00'::time without time zone NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE rrhh.usuarios_config_partes ADD CONSTRAINT usuarios_config_partes_usuario_id_key UNIQUE (usuario_id);
ALTER TABLE rrhh.usuarios_config_partes ADD CONSTRAINT usuarios_config_partes_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX usuarios_config_partes_usuario_id_key ON rrhh.usuarios_config_partes USING btree (usuario_id);
CREATE INDEX idx_usuarios_config_partes_usuario ON rrhh.usuarios_config_partes USING btree (usuario_id);
CREATE INDEX idx_usuarios_config_partes_empresa ON rrhh.usuarios_config_partes USING btree (empresa_id);


-- =============================================
-- ESQUEMA: SEG
-- =============================================

CREATE SCHEMA IF NOT EXISTS seg;

-- Tabla: seg.empresas
CREATE TABLE IF NOT EXISTS seg.empresas (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  nombre varchar(255) NOT NULL,
  direccion text,
  horarios text,
  servicios jsonb DEFAULT '[]'::jsonb,
  webhook_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE seg.empresas ADD CONSTRAINT empresas_pkey PRIMARY KEY (id);

-- Tabla: seg.feedback_comentarios
CREATE TABLE IF NOT EXISTS seg.feedback_comentarios (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  feedback_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  usuario_email text,
  usuario_nombre text,
  mensaje text NOT NULL,
  es_interno boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE seg.feedback_comentarios ADD CONSTRAINT feedback_comentarios_pkey PRIMARY KEY (id);

CREATE INDEX idx_feedback_comentarios_feedback_id ON seg.feedback_comentarios USING btree (feedback_id);
CREATE INDEX idx_feedback_comentarios_created_at ON seg.feedback_comentarios USING btree (created_at);

-- Tabla: seg.feedback_historial_estados
CREATE TABLE IF NOT EXISTS seg.feedback_historial_estados (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  feedback_id uuid NOT NULL,
  estado_anterior text,
  estado_nuevo text NOT NULL,
  usuario_id uuid,
  usuario_email text,
  usuario_nombre text,
  created_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE seg.feedback_historial_estados ADD CONSTRAINT feedback_historial_estados_pkey PRIMARY KEY (id);
ALTER TABLE seg.feedback_historial_estados ADD CONSTRAINT feedback_historial_estados_feedback_id_fkey FOREIGN KEY (feedback_id) REFERENCES seg.feedbacks(id) ON DELETE CASCADE;

CREATE INDEX idx_feedback_historial_feedback_id ON seg.feedback_historial_estados USING btree (feedback_id);
CREATE INDEX idx_feedback_historial_created_at ON seg.feedback_historial_estados USING btree (created_at DESC);

-- Tabla: seg.feedbacks
CREATE TABLE IF NOT EXISTS seg.feedbacks (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  usuario_id uuid NOT NULL,
  usuario_email varchar(255),
  usuario_nombre varchar(255),
  tipo varchar(50) NOT NULL,
  mensaje text NOT NULL,
  estado varchar(20) DEFAULT 'pendiente'::character varying NOT NULL,
  respuesta text,
  respondido_por uuid,
  respondido_at timestamp with time zone,
  empresa_id uuid,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  archivos_adjuntos text[] DEFAULT '{}'::text[],
  modulo_referencia text,
  asignado_a uuid,
  asignado_at timestamp with time zone,
  asignado_por uuid,
  destacado boolean DEFAULT false NOT NULL
);

ALTER TABLE seg.feedbacks ADD CONSTRAINT feedbacks_pkey PRIMARY KEY (id);
ALTER TABLE seg.feedbacks ADD CONSTRAINT feedbacks_asignado_a_fkey FOREIGN KEY (asignado_a) REFERENCES seg.usuarios(id) ON DELETE SET NULL;
ALTER TABLE seg.feedbacks ADD CONSTRAINT feedbacks_asignado_por_fkey FOREIGN KEY (asignado_por) REFERENCES seg.usuarios(id) ON DELETE SET NULL;
ALTER TABLE seg.feedbacks ADD CONSTRAINT feedbacks_estado_check CHECK (((estado)::text = ANY ((ARRAY['pendiente'::character varying, 'en_revision'::character varying, 'resuelto'::character varying, 'cerrado'::character varying])::text[])));
ALTER TABLE seg.feedbacks ADD CONSTRAINT feedbacks_tipo_check CHECK (((tipo)::text = ANY ((ARRAY['sugerencia'::character varying, 'mejora'::character varying, 'queja'::character varying, 'bug'::character varying, 'consulta'::character varying, 'ayuda'::character varying, 'acceso-permiso'::character varying])::text[])));

CREATE INDEX idx_feedbacks_usuario_id ON seg.feedbacks USING btree (usuario_id);
CREATE INDEX idx_feedbacks_tipo ON seg.feedbacks USING btree (tipo);
CREATE INDEX idx_feedbacks_estado ON seg.feedbacks USING btree (estado);
CREATE INDEX idx_feedbacks_created_at ON seg.feedbacks USING btree (created_at DESC);
CREATE INDEX idx_feedbacks_asignado_a ON seg.feedbacks USING btree (asignado_a);
CREATE INDEX idx_feedbacks_destacado ON seg.feedbacks USING btree (destacado) WHERE (destacado = true);

-- Tabla: seg.modulos
CREATE TABLE IF NOT EXISTS seg.modulos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  nombre varchar(255) NOT NULL,
  descripcion text,
  activo boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  icono varchar(50) DEFAULT 'AppWindow'::character varying,
  ruta varchar(255) DEFAULT NULL::character varying,
  link_documentos text,
  prd_documento text,
  repositorio text,
  modulo_padre_id uuid,
  orden integer DEFAULT 0,
  empresa_id uuid,
  codigo varchar(50),
  permisos_requeridos text[] DEFAULT '{}'::text[]
);

ALTER TABLE seg.modulos ADD CONSTRAINT aplicaciones_pkey PRIMARY KEY (id);
ALTER TABLE seg.modulos ADD CONSTRAINT modulos_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES seg.empresas(id) ON DELETE CASCADE;
ALTER TABLE seg.modulos ADD CONSTRAINT modulos_modulo_padre_id_fkey FOREIGN KEY (modulo_padre_id) REFERENCES seg.modulos(id) ON DELETE SET NULL;

CREATE INDEX idx_modulos_padre ON seg.modulos USING btree (modulo_padre_id);
CREATE INDEX idx_modulos_empresa ON seg.modulos USING btree (empresa_id);

-- Tabla: seg.notificaciones
CREATE TABLE IF NOT EXISTS seg.notificaciones (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid NOT NULL,
  usuario_id uuid NOT NULL,
  titulo text NOT NULL,
  mensaje text NOT NULL,
  tipo text DEFAULT 'info'::text NOT NULL,
  leida boolean DEFAULT false NOT NULL,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

ALTER TABLE seg.notificaciones ADD CONSTRAINT notificaciones_pkey PRIMARY KEY (id);
ALTER TABLE seg.notificaciones ADD CONSTRAINT notificaciones_tipo_check CHECK ((tipo = ANY (ARRAY['info'::text, 'success'::text, 'warning'::text, 'message'::text])));

CREATE INDEX idx_notificaciones_usuario ON seg.notificaciones USING btree (usuario_id);
CREATE INDEX idx_notificaciones_empresa ON seg.notificaciones USING btree (empresa_id);
CREATE INDEX idx_notificaciones_leida ON seg.notificaciones USING btree (leida);
CREATE INDEX idx_notificaciones_created ON seg.notificaciones USING btree (created_at DESC);

-- Tabla: seg.permisos
CREATE TABLE IF NOT EXISTS seg.permisos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  nombre varchar(255) NOT NULL,
  descripcion text,
  modulo varchar(255),
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE seg.permisos ADD CONSTRAINT permisos_nombre_modulo_key UNIQUE (nombre, modulo);
ALTER TABLE seg.permisos ADD CONSTRAINT permisos_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX permisos_nombre_modulo_key ON seg.permisos USING btree (nombre, modulo);

-- Tabla: seg.preferencias_usuario
CREATE TABLE IF NOT EXISTS seg.preferencias_usuario (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  usuario_id uuid NOT NULL,
  email_notifications boolean DEFAULT true,
  push_notifications boolean DEFAULT false,
  desktop_notifications boolean DEFAULT true,
  new_messages boolean DEFAULT true,
  task_updates boolean DEFAULT true,
  system_alerts boolean DEFAULT true,
  weekly_digest boolean DEFAULT false,
  idioma varchar(10) DEFAULT 'es'::character varying,
  zona_horaria varchar(50) DEFAULT 'America/Buenos_Aires'::character varying,
  formato_fecha varchar(20) DEFAULT 'dd/MM/yyyy'::character varying,
  densidad_ui varchar(20) DEFAULT 'comfortable'::character varying,
  tema varchar(20) DEFAULT 'system'::character varying,
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL,
  preservar_scroll boolean DEFAULT true NOT NULL,
  animaciones_reducidas boolean DEFAULT false NOT NULL,
  confirmar_eliminar boolean DEFAULT true NOT NULL,
  sonidos_notificacion boolean DEFAULT true NOT NULL
);

ALTER TABLE seg.preferencias_usuario ADD CONSTRAINT preferencias_usuario_usuario_id_key UNIQUE (usuario_id);
ALTER TABLE seg.preferencias_usuario ADD CONSTRAINT preferencias_usuario_pkey PRIMARY KEY (id);

CREATE UNIQUE INDEX preferencias_usuario_usuario_id_key ON seg.preferencias_usuario USING btree (usuario_id);

-- Tabla: seg.publicaciones
CREATE TABLE IF NOT EXISTS seg.publicaciones (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  empresa_id uuid,
  titulo varchar(255) NOT NULL,
  contenido text NOT NULL,
  autor_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE seg.publicaciones ADD CONSTRAINT publicaciones_pkey PRIMARY KEY (id);
ALTER TABLE seg.publicaciones ADD CONSTRAINT publicaciones_autor_id_fkey FOREIGN KEY (autor_id) REFERENCES seg.usuarios(id) ON DELETE SET NULL;
ALTER TABLE seg.publicaciones ADD CONSTRAINT publicaciones_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES seg.empresas(id) ON DELETE CASCADE;

CREATE INDEX idx_publicaciones_empresa_id ON seg.publicaciones USING btree (empresa_id);
CREATE INDEX idx_publicaciones_created_at ON seg.publicaciones USING btree (created_at DESC);

-- Tabla: seg.rol_permiso
CREATE TABLE IF NOT EXISTS seg.rol_permiso (
  rol_id uuid NOT NULL,
  permiso_id uuid NOT NULL
);

ALTER TABLE seg.rol_permiso ADD CONSTRAINT rol_permiso_pkey PRIMARY KEY (rol_id, permiso_id);
ALTER TABLE seg.rol_permiso ADD CONSTRAINT rol_permiso_permiso_id_fkey FOREIGN KEY (permiso_id) REFERENCES seg.permisos(id) ON DELETE CASCADE;
ALTER TABLE seg.rol_permiso ADD CONSTRAINT rol_permiso_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES seg.roles(id) ON DELETE CASCADE;

-- Tabla: seg.roles
CREATE TABLE IF NOT EXISTS seg.roles (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  nombre varchar(255) NOT NULL,
  descripcion text,
  empresa_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE seg.roles ADD CONSTRAINT roles_nombre_empresa_id_key UNIQUE (nombre, empresa_id);
ALTER TABLE seg.roles ADD CONSTRAINT roles_pkey PRIMARY KEY (id);
ALTER TABLE seg.roles ADD CONSTRAINT roles_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES seg.empresas(id) ON DELETE CASCADE;

CREATE INDEX idx_roles_empresa_id ON seg.roles USING btree (empresa_id);
CREATE UNIQUE INDEX roles_nombre_empresa_id_key ON seg.roles USING btree (nombre, empresa_id);

-- Tabla: seg.usuario_favoritos
CREATE TABLE IF NOT EXISTS seg.usuario_favoritos (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  usuario_id uuid NOT NULL,
  modulo_id uuid NOT NULL,
  orden integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE seg.usuario_favoritos ADD CONSTRAINT usuario_favoritos_usuario_id_modulo_id_key UNIQUE (usuario_id, modulo_id);
ALTER TABLE seg.usuario_favoritos ADD CONSTRAINT usuario_favoritos_pkey PRIMARY KEY (id);
ALTER TABLE seg.usuario_favoritos ADD CONSTRAINT usuario_favoritos_modulo_id_fkey FOREIGN KEY (modulo_id) REFERENCES seg.modulos(id) ON DELETE CASCADE;
ALTER TABLE seg.usuario_favoritos ADD CONSTRAINT usuario_favoritos_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES seg.usuarios(id) ON DELETE CASCADE;

CREATE UNIQUE INDEX usuario_favoritos_usuario_id_modulo_id_key ON seg.usuario_favoritos USING btree (usuario_id, modulo_id);

-- Tabla: seg.usuario_rol
CREATE TABLE IF NOT EXISTS seg.usuario_rol (
  usuario_id uuid NOT NULL,
  rol_id uuid NOT NULL,
  modulo_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now()
);

ALTER TABLE seg.usuario_rol ADD CONSTRAINT usuario_rol_pkey PRIMARY KEY (usuario_id, rol_id, modulo_id);
ALTER TABLE seg.usuario_rol ADD CONSTRAINT usuario_rol_aplicacion_id_fkey FOREIGN KEY (modulo_id) REFERENCES seg.modulos(id) ON DELETE CASCADE;
ALTER TABLE seg.usuario_rol ADD CONSTRAINT usuario_rol_rol_id_fkey FOREIGN KEY (rol_id) REFERENCES seg.roles(id) ON DELETE CASCADE;
ALTER TABLE seg.usuario_rol ADD CONSTRAINT usuario_rol_usuario_id_fkey FOREIGN KEY (usuario_id) REFERENCES seg.usuarios(id) ON DELETE CASCADE;

CREATE INDEX idx_usuario_rol_usuario_id ON seg.usuario_rol USING btree (usuario_id);
CREATE INDEX idx_usuario_rol_rol_id ON seg.usuario_rol USING btree (rol_id);
CREATE INDEX idx_usuario_rol_aplicacion_id ON seg.usuario_rol USING btree (modulo_id);

-- Tabla: seg.usuarios
CREATE TABLE IF NOT EXISTS seg.usuarios (
  id uuid DEFAULT gen_random_uuid() NOT NULL,
  email varchar(255) NOT NULL,
  nombre varchar(100),
  apellido varchar(100),
  dni varchar(20),
  direccion text,
  telefono varchar(20),
  activo boolean DEFAULT true,
  empresa_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

ALTER TABLE seg.usuarios ADD CONSTRAINT usuarios_email_key UNIQUE (email);
ALTER TABLE seg.usuarios ADD CONSTRAINT usuarios_pkey PRIMARY KEY (id);
ALTER TABLE seg.usuarios ADD CONSTRAINT usuarios_empresa_id_fkey FOREIGN KEY (empresa_id) REFERENCES seg.empresas(id) ON DELETE SET NULL;

CREATE INDEX idx_usuarios_activo ON seg.usuarios USING btree (activo);
CREATE UNIQUE INDEX usuarios_email_key ON seg.usuarios USING btree (email);
CREATE INDEX idx_usuarios_email ON seg.usuarios USING btree (email);
CREATE INDEX idx_usuarios_empresa_id ON seg.usuarios USING btree (empresa_id);

-- Funciones del esquema seg
CREATE OR REPLACE FUNCTION seg.get_my_feedbacks()
 RETURNS SETOF seg.feedbacks
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'seg'
AS $function$
  SELECT *
  FROM seg.feedbacks
  WHERE usuario_id = public.get_current_usuario_id()
  ORDER BY created_at DESC;
$function$
;

CREATE OR REPLACE FUNCTION seg.is_admin(user_id uuid)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'seg'
AS $function$
  SELECT EXISTS (
    SELECT 1 
    FROM seg.usuario_rol ur
    JOIN seg.roles r ON r.id = ur.rol_id
    WHERE ur.usuario_id = user_id
    AND (LOWER(r.nombre) LIKE '%admin%' OR LOWER(r.nombre) LIKE '%administrador%')
  )
$function$
;


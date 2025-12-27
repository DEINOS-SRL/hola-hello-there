-- Insertar sección "Comercial" (módulo padre)
DO $$
DECLARE
  comercial_id UUID;
BEGIN
  -- Crear sección Comercial
  INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, codigo)
  VALUES (
    'Comercial',
    'Gestión comercial: presupuestos, certificaciones y seguimientos',
    'Briefcase',
    '/comercial',
    3,
    true,
    NULL,
    'SEC_COMERCIAL'
  )
  RETURNING id INTO comercial_id;

  -- Crear módulo Presupuestos
  INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, codigo)
  VALUES (
    'Presupuestos',
    'Gestión de presupuestos y cotizaciones',
    'FileSpreadsheet',
    '/comercial/presupuestos',
    1,
    true,
    comercial_id,
    'MOD_PRESUPUESTOS'
  );

  -- Crear módulo Certificaciones
  INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, codigo)
  VALUES (
    'Certificaciones',
    'Gestión de certificaciones comerciales',
    'FileCheck2',
    '/comercial/certificaciones',
    2,
    true,
    comercial_id,
    'MOD_CERTIFICACIONES_COM'
  );

  -- Crear módulo Seguimientos
  INSERT INTO seg.modulos (nombre, descripcion, icono, ruta, orden, activo, modulo_padre_id, codigo)
  VALUES (
    'Seguimientos',
    'Seguimiento de operaciones comerciales',
    'Activity',
    '/comercial/seguimientos',
    3,
    true,
    comercial_id,
    'MOD_SEGUIMIENTOS'
  );
END $$;
-- Crear módulo Configuración como módulo padre
INSERT INTO seg.modulos (id, nombre, descripcion, icono, ruta, modulo_padre_id, orden, activo, permisos_requeridos)
VALUES (
  'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  'Configuración',
  'Configuración del sistema y administración',
  'Settings',
  '/configuracion',
  NULL,
  20,
  true,
  ARRAY[]::text[]
);

-- Renombrar Seguridad a Administración y hacerlo submódulo de Configuración
UPDATE seg.modulos 
SET 
  nombre = 'Administración',
  descripcion = 'Gestión de usuarios, roles, empresas y permisos',
  modulo_padre_id = 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  ruta = '/configuracion/administracion',
  orden = 1
WHERE id = 'e23bf127-8c68-462d-8c4b-de6a3a79c7b8';
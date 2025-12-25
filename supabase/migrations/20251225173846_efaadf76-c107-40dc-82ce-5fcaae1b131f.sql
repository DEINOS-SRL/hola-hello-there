-- Temporalmente deshabilitar RLS para insertar datos
ALTER TABLE seg.roles DISABLE ROW LEVEL SECURITY;
ALTER TABLE seg.rol_permiso DISABLE ROW LEVEL SECURITY;

-- Insertar nuevos roles
INSERT INTO seg.roles (nombre, descripcion) VALUES
  ('Supervisor', 'Puede ver y aprobar movimientos, partes diarios y gestionar empleados'),
  ('Operador', 'Puede crear y ver movimientos, partes diarios y equipos'),
  ('Consultor', 'Solo lectura en todos los módulos');

-- Asignar TODOS los permisos al rol Administrador
INSERT INTO seg.rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM seg.roles r
CROSS JOIN seg.permisos p
WHERE r.nombre = 'Administrador'
ON CONFLICT DO NOTHING;

-- Permisos para Supervisor (ver, editar, aprobar en operaciones + gestión empleados)
INSERT INTO seg.rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM seg.roles r
CROSS JOIN seg.permisos p
WHERE r.nombre = 'Supervisor'
  AND p.nombre IN (
    -- Empleados: CRUD completo
    'employees.read', 'employees.create', 'employees.update', 'employees.delete',
    -- Equipos: ver y editar
    'equipos.read', 'equipos.update',
    -- Habilitaciones: ver y editar
    'habilitaciones.read', 'habilitaciones.update',
    -- Movimientos: ver, editar, aprobar
    'movimientos.read', 'movimientos.update', 'movimientos.approve',
    -- Partes diarios: ver, editar, aprobar
    'partes-diarios.read', 'partes-diarios.update', 'partes-diarios.approve'
  )
ON CONFLICT DO NOTHING;

-- Permisos para Operador (crear y ver, sin aprobar ni eliminar)
INSERT INTO seg.rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM seg.roles r
CROSS JOIN seg.permisos p
WHERE r.nombre = 'Operador'
  AND p.nombre IN (
    -- Empleados: solo ver
    'employees.read',
    -- Equipos: ver y crear
    'equipos.read', 'equipos.create', 'equipos.update',
    -- Habilitaciones: ver
    'habilitaciones.read',
    -- Movimientos: crear, ver, editar
    'movimientos.read', 'movimientos.create', 'movimientos.update',
    -- Partes diarios: crear, ver, editar
    'partes-diarios.read', 'partes-diarios.create', 'partes-diarios.update'
  )
ON CONFLICT DO NOTHING;

-- Permisos para Consultor (solo lectura en todo)
INSERT INTO seg.rol_permiso (rol_id, permiso_id)
SELECT r.id, p.id
FROM seg.roles r
CROSS JOIN seg.permisos p
WHERE r.nombre = 'Consultor'
  AND p.nombre LIKE '%.read'
ON CONFLICT DO NOTHING;

-- Rehabilitar RLS
ALTER TABLE seg.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE seg.rol_permiso ENABLE ROW LEVEL SECURITY;
-- Limpiar permisos antiguos y sincronizar con manifests de módulos
DELETE FROM seg_permisos;

-- Insertar permisos del módulo de Seguridad
INSERT INTO seg_permisos (nombre, descripcion, modulo) VALUES
-- Seguridad - Empresas
('security.empresas.read', 'Permite ver la lista de empresas', 'security'),
('security.empresas.create', 'Permite crear nuevas empresas', 'security'),
('security.empresas.update', 'Permite editar empresas existentes', 'security'),
('security.empresas.delete', 'Permite eliminar empresas', 'security'),
-- Seguridad - Usuarios
('security.usuarios.read', 'Permite ver la lista de usuarios', 'security'),
('security.usuarios.create', 'Permite crear nuevos usuarios', 'security'),
('security.usuarios.update', 'Permite editar usuarios existentes', 'security'),
('security.usuarios.delete', 'Permite eliminar usuarios', 'security'),
-- Seguridad - Roles
('security.roles.read', 'Permite ver la lista de roles', 'security'),
('security.roles.create', 'Permite crear nuevos roles', 'security'),
('security.roles.update', 'Permite editar roles existentes', 'security'),
('security.roles.delete', 'Permite eliminar roles', 'security'),
-- Seguridad - Permisos
('security.permisos.assign', 'Permite asignar permisos a roles', 'security'),
-- Seguridad - Aplicaciones
('security.aplicaciones.read', 'Permite ver la lista de aplicaciones', 'security'),
('security.aplicaciones.manage', 'Permite gestionar aplicaciones', 'security'),

-- Insertar permisos del módulo de Empleados
('employees.read', 'Permite ver la lista de empleados', 'employees'),
('employees.create', 'Permite crear nuevos empleados', 'employees'),
('employees.update', 'Permite editar empleados existentes', 'employees'),
('employees.delete', 'Permite eliminar empleados', 'employees'),

-- Insertar permisos del módulo de Equipos
('equipos.read', 'Permite ver la lista de equipos', 'equipos'),
('equipos.create', 'Permite crear nuevos equipos', 'equipos'),
('equipos.update', 'Permite editar equipos existentes', 'equipos'),
('equipos.delete', 'Permite eliminar equipos', 'equipos'),

-- Insertar permisos del módulo de Movimientos
('movimientos.read', 'Permite ver la lista de movimientos', 'movimientos'),
('movimientos.create', 'Permite crear nuevos movimientos', 'movimientos'),
('movimientos.update', 'Permite editar movimientos existentes', 'movimientos'),
('movimientos.delete', 'Permite eliminar movimientos', 'movimientos'),
('movimientos.approve', 'Permite aprobar movimientos', 'movimientos'),

-- Insertar permisos del módulo de Partes Diarios
('partes-diarios.read', 'Permite ver la lista de partes diarios', 'partes-diarios'),
('partes-diarios.create', 'Permite crear nuevos partes diarios', 'partes-diarios'),
('partes-diarios.update', 'Permite editar partes diarios existentes', 'partes-diarios'),
('partes-diarios.delete', 'Permite eliminar partes diarios', 'partes-diarios'),
('partes-diarios.approve', 'Permite aprobar partes diarios', 'partes-diarios'),

-- Insertar permisos del módulo de Habilitaciones
('habilitaciones.read', 'Permite ver la lista de habilitaciones', 'habilitaciones'),
('habilitaciones.create', 'Permite crear nuevas habilitaciones', 'habilitaciones'),
('habilitaciones.update', 'Permite editar habilitaciones existentes', 'habilitaciones'),
('habilitaciones.delete', 'Permite eliminar habilitaciones', 'habilitaciones');
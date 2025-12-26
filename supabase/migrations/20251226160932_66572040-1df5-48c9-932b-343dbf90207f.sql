-- Eliminar tablas legacy que ya no se usan
-- Ahora usamos emp.empleados y equ.equipos con las tablas de relación
-- mov.movimientos_empleados y mov.movimientos_equipos_equ

-- Primero eliminar las tablas de relación legacy (tienen FK a las tablas principales)
DROP TABLE IF EXISTS mov.movimientos_operarios CASCADE;
DROP TABLE IF EXISTS mov.movimientos_equipos CASCADE;

-- Luego eliminar las tablas principales legacy
DROP TABLE IF EXISTS mov.recursos_operarios CASCADE;
DROP TABLE IF EXISTS mov.recursos_equipos CASCADE;
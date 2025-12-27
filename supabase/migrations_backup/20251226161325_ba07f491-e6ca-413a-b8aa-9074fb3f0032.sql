-- Insertar empleados de prueba en emp.empleados
INSERT INTO emp.empleados (empresa_id, legajo, nombre, apellido, dni, cargo, departamento, email, telefono, estado) VALUES
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'EMP001', 'Juan', 'Pérez', '30123456', 'Operario', 'Operaciones', 'juan.perez@empresa.com', '1155001234', 'activo'),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'EMP002', 'María', 'González', '31234567', 'Supervisor', 'Operaciones', 'maria.gonzalez@empresa.com', '1155002345', 'activo'),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'EMP003', 'Carlos', 'Rodríguez', '32345678', 'Operario', 'Mantenimiento', 'carlos.rodriguez@empresa.com', '1155003456', 'activo'),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'EMP004', 'Ana', 'Martínez', '33456789', 'Supervisor', 'Logística', 'ana.martinez@empresa.com', '1155004567', 'activo'),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'EMP005', 'Pedro', 'López', '34567890', 'Operario', 'Operaciones', 'pedro.lopez@empresa.com', '1155005678', 'activo');

-- Insertar equipos de prueba en equ.equipos
INSERT INTO equ.equipos (empresa_id, codigo, nombre, descripcion, numero_interno, anio_fabricacion, estado, ubicacion, activo) VALUES
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'CAM001', 'Camión Volvo FH', 'Camión de carga pesada', 'INT-001', 2022, 'activo', 'Base Central', true),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'CAM002', 'Camión Scania R450', 'Camión semi-remolque', 'INT-002', 2021, 'activo', 'Base Central', true),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'GRU001', 'Grúa Liebherr LTM', 'Grúa móvil 100 toneladas', 'INT-003', 2020, 'activo', 'Depósito Norte', true),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'RET001', 'Retroexcavadora CAT 420F', 'Retroexcavadora cargadora', 'INT-004', 2023, 'activo', 'Base Central', true),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'CAM003', 'Camioneta Ford Ranger', 'Vehículo utilitario', 'INT-005', 2024, 'activo', 'Base Central', true);
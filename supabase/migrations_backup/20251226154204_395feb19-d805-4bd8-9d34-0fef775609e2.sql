-- Insertar Unidades de Negocio
INSERT INTO mov.unidades_negocio (empresa_id, nombre, descripcion, activo, orden) VALUES
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'Transporte y Logística', 'Servicios de transporte y logística', true, 1),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'Rental', 'Alquiler de equipos', true, 2),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'Grúas-Izajes', 'Servicios de grúas e izajes', true, 3),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'Obras', 'Obras civiles', true, 4),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'Planta Hormigón & Áridos', 'Producción de hormigón y áridos', true, 5),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'Movimiento de Suelo', 'Movimiento de suelo y excavaciones', true, 6),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'Servicios', 'Servicios generales', true, 7),
('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', 'Otros', 'Otros servicios', true, 8);

-- Obtener el ID de Transporte y Logística para insertar los tipos
DO $$
DECLARE
  unidad_id UUID;
  tipo_dtm_id UUID;
BEGIN
  -- Obtener ID de Transporte y Logística
  SELECT id INTO unidad_id FROM mov.unidades_negocio 
  WHERE nombre = 'Transporte y Logística' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

  -- Insertar Tipos de Movimiento para Transporte y Logística
  INSERT INTO mov.tipos_movimiento (empresa_id, unidad_negocio_id, nombre, descripcion, activo, orden) VALUES
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', unidad_id, 'Cargas Líquidas', 'Transporte de cargas líquidas', true, 1),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', unidad_id, 'Cargas Sólidas', 'Transporte de cargas sólidas', true, 2),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', unidad_id, 'Servicio de DTM', 'Servicio de transporte DTM', true, 3),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', unidad_id, 'Transporte de Personal', 'Transporte de personal', true, 4),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', unidad_id, 'Otros', 'Otros tipos de transporte', true, 5);

  -- Obtener ID de Servicio de DTM para insertar subtipos
  SELECT id INTO tipo_dtm_id FROM mov.tipos_movimiento 
  WHERE nombre = 'Servicio de DTM' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

  -- Insertar Subtipos para Servicio de DTM
  INSERT INTO mov.subtipos_movimiento (empresa_id, tipo_movimiento_id, nombre, descripcion, activo, orden) VALUES
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', tipo_dtm_id, 'Tractor', 'Servicio con tractor', true, 1),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', tipo_dtm_id, 'Semi', 'Servicio con semi', true, 2),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', tipo_dtm_id, 'Deprimido', 'Servicio con deprimido', true, 3),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', tipo_dtm_id, 'Petrolero 120', 'Petrolero 120', true, 4),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', tipo_dtm_id, 'Carretón 3E 2,60Mts', 'Carretón 3 ejes 2,60 metros', true, 5),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', tipo_dtm_id, 'Carretón 3E 3,00 Mts', 'Carretón 3 ejes 3,00 metros', true, 6),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', tipo_dtm_id, 'Carretón 4E 3,00 Mts', 'Carretón 4 ejes 3,00 metros', true, 7),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', tipo_dtm_id, 'Carretón 5E 3,00 Mts', 'Carretón 5 ejes 3,00 metros', true, 8),
  ('6073c01c-b1e7-4b0b-bc6b-fa675972abe5', tipo_dtm_id, 'Otros', 'Otros subtipos DTM', true, 9);
END $$;
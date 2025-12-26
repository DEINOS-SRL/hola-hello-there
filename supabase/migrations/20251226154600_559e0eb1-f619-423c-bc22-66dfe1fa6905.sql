-- Actualizar campos dinámicos para cada subtipo de DTM
UPDATE mov.subtipos_movimiento 
SET campos_adicionales = '[
  {"key": "potencia_hp", "label": "Potencia (HP)", "type": "number", "required": false},
  {"key": "tipo_enganche", "label": "Tipo de Enganche", "type": "select", "options": ["Plato", "Perno", "Quinta rueda"], "required": true}
]'::jsonb
WHERE nombre = 'Tractor' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

UPDATE mov.subtipos_movimiento 
SET campos_adicionales = '[
  {"key": "capacidad_tn", "label": "Capacidad (Tn)", "type": "number", "required": true},
  {"key": "largo_mts", "label": "Largo (Mts)", "type": "number", "required": false},
  {"key": "tipo_carga", "label": "Tipo de Carga", "type": "select", "options": ["General", "Granel", "Contenedor", "Especializada"], "required": true}
]'::jsonb
WHERE nombre = 'Semi' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

UPDATE mov.subtipos_movimiento 
SET campos_adicionales = '[
  {"key": "largo_plataforma", "label": "Largo Plataforma (Mts)", "type": "number", "required": true},
  {"key": "altura_max", "label": "Altura Máxima Carga (Mts)", "type": "number", "required": true},
  {"key": "peso_max_tn", "label": "Peso Máximo (Tn)", "type": "number", "required": true},
  {"key": "requiere_escolta", "label": "Requiere Escolta", "type": "checkbox", "required": false}
]'::jsonb
WHERE nombre = 'Deprimido' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

UPDATE mov.subtipos_movimiento 
SET campos_adicionales = '[
  {"key": "capacidad_lts", "label": "Capacidad (Litros)", "type": "number", "required": true},
  {"key": "tipo_producto", "label": "Tipo de Producto", "type": "select", "options": ["Gasoil", "Nafta", "Agua", "Químicos", "Otros"], "required": true},
  {"key": "certificacion_adr", "label": "Requiere Certificación ADR", "type": "checkbox", "required": false}
]'::jsonb
WHERE nombre = 'Petrolero 120' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

UPDATE mov.subtipos_movimiento 
SET campos_adicionales = '[
  {"key": "peso_carga_tn", "label": "Peso Carga (Tn)", "type": "number", "required": true},
  {"key": "largo_carga", "label": "Largo Carga (Mts)", "type": "number", "required": false},
  {"key": "ancho_carga", "label": "Ancho Carga (Mts)", "type": "number", "required": false},
  {"key": "tipo_maquinaria", "label": "Tipo Maquinaria", "type": "select", "options": ["Excavadora", "Retroexcavadora", "Pala cargadora", "Rodillo", "Grúa", "Otros"], "required": true},
  {"key": "requiere_escolta", "label": "Requiere Escolta", "type": "checkbox", "required": false}
]'::jsonb
WHERE nombre = 'Carretón 3E 2,60Mts' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

UPDATE mov.subtipos_movimiento 
SET campos_adicionales = '[
  {"key": "peso_carga_tn", "label": "Peso Carga (Tn)", "type": "number", "required": true},
  {"key": "largo_carga", "label": "Largo Carga (Mts)", "type": "number", "required": false},
  {"key": "ancho_carga", "label": "Ancho Carga (Mts)", "type": "number", "required": false},
  {"key": "tipo_maquinaria", "label": "Tipo Maquinaria", "type": "select", "options": ["Excavadora", "Retroexcavadora", "Pala cargadora", "Rodillo", "Grúa", "Otros"], "required": true},
  {"key": "requiere_escolta", "label": "Requiere Escolta", "type": "checkbox", "required": false}
]'::jsonb
WHERE nombre = 'Carretón 3E 3,00 Mts' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

UPDATE mov.subtipos_movimiento 
SET campos_adicionales = '[
  {"key": "peso_carga_tn", "label": "Peso Carga (Tn)", "type": "number", "required": true},
  {"key": "largo_carga", "label": "Largo Carga (Mts)", "type": "number", "required": false},
  {"key": "ancho_carga", "label": "Ancho Carga (Mts)", "type": "number", "required": false},
  {"key": "alto_carga", "label": "Alto Carga (Mts)", "type": "number", "required": false},
  {"key": "tipo_maquinaria", "label": "Tipo Maquinaria", "type": "select", "options": ["Excavadora grande", "Grúa pesada", "Maquinaria especial", "Estructura metálica", "Otros"], "required": true},
  {"key": "requiere_escolta", "label": "Requiere Escolta", "type": "checkbox", "required": false},
  {"key": "permiso_especial", "label": "Requiere Permiso Especial", "type": "checkbox", "required": false}
]'::jsonb
WHERE nombre = 'Carretón 4E 3,00 Mts' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

UPDATE mov.subtipos_movimiento 
SET campos_adicionales = '[
  {"key": "peso_carga_tn", "label": "Peso Carga (Tn)", "type": "number", "required": true},
  {"key": "largo_carga", "label": "Largo Carga (Mts)", "type": "number", "required": false},
  {"key": "ancho_carga", "label": "Ancho Carga (Mts)", "type": "number", "required": false},
  {"key": "alto_carga", "label": "Alto Carga (Mts)", "type": "number", "required": false},
  {"key": "tipo_maquinaria", "label": "Tipo Maquinaria", "type": "select", "options": ["Grúa pesada", "Excavadora gigante", "Maquinaria industrial", "Transformador", "Estructura especial", "Otros"], "required": true},
  {"key": "requiere_escolta", "label": "Requiere Escolta", "type": "checkbox", "required": false},
  {"key": "permiso_especial", "label": "Requiere Permiso Especial", "type": "checkbox", "required": false},
  {"key": "horario_restringido", "label": "Horario Restringido", "type": "checkbox", "required": false}
]'::jsonb
WHERE nombre = 'Carretón 5E 3,00 Mts' AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';

UPDATE mov.subtipos_movimiento 
SET campos_adicionales = '[
  {"key": "descripcion_servicio", "label": "Descripción del Servicio", "type": "text", "required": true},
  {"key": "peso_estimado", "label": "Peso Estimado (Tn)", "type": "number", "required": false}
]'::jsonb
WHERE nombre = 'Otros' AND tipo_movimiento_id IN (
  SELECT id FROM mov.tipos_movimiento WHERE nombre = 'Servicio de DTM'
) AND empresa_id = '6073c01c-b1e7-4b0b-bc6b-fa675972abe5';
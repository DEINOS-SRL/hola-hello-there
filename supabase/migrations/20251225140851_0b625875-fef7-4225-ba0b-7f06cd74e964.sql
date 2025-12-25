-- Agregar columnas para icono y ruta a seg_aplicaciones
ALTER TABLE seg_aplicaciones 
ADD COLUMN IF NOT EXISTS icono VARCHAR(50) DEFAULT 'AppWindow',
ADD COLUMN IF NOT EXISTS ruta VARCHAR(255) DEFAULT NULL;

-- Actualizar las aplicaciones existentes
UPDATE seg_aplicaciones SET icono = 'Shield', ruta = '/seguridad' WHERE nombre = 'Módulo de Seguridad';
UPDATE seg_aplicaciones SET icono = 'ClipboardList', ruta = '/partes-diarios' WHERE nombre = 'Partes Diarios';

-- Insertar módulos faltantes con activa = false (próximamente)
INSERT INTO seg_aplicaciones (nombre, descripcion, activa, icono, ruta)
VALUES 
  ('Reportes', 'Generación y visualización de reportes empresariales', false, 'BarChart3', '/reportes'),
  ('Documentos', 'Gestión documental y archivos corporativos', false, 'FileText', '/documentos'),
  ('Calendario', 'Programación de eventos y recordatorios', false, 'Calendar', '/calendario'),
  ('Mensajería', 'Sistema de comunicación interna', false, 'MessageSquare', '/mensajeria');
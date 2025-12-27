-- Mover "Registro de Partes" como submódulo de Equipos
UPDATE seg.modulos 
SET modulo_padre_id = '5093375b-6db4-4b7f-beeb-236dd5b6836c', -- ID de Equipos
    ruta = '/equipos/partes',
    nombre = 'Partes de Equipos'
WHERE id = '80958cc9-9777-47f0-98db-3210d4b9aeee';

-- Eliminar el módulo padre "Partes Diarios" ya que quedó vacío
DELETE FROM seg.modulos WHERE id = '0ae11348-be28-4d3b-8ad8-ed0d18dee925';
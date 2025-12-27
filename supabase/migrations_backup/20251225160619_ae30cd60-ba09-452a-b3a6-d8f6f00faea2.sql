-- Crear schema para módulo de Seguridad
CREATE SCHEMA IF NOT EXISTS seg;

-- Mover y renombrar tablas al schema seg (quitar prefijo seg_)
ALTER TABLE public.seg_empresas SET SCHEMA seg;
ALTER TABLE seg.seg_empresas RENAME TO empresas;

ALTER TABLE public.seg_aplicaciones SET SCHEMA seg;
ALTER TABLE seg.seg_aplicaciones RENAME TO aplicaciones;

ALTER TABLE public.seg_permisos SET SCHEMA seg;
ALTER TABLE seg.seg_permisos RENAME TO permisos;

ALTER TABLE public.seg_roles SET SCHEMA seg;
ALTER TABLE seg.seg_roles RENAME TO roles;

ALTER TABLE public.seg_usuarios SET SCHEMA seg;
ALTER TABLE seg.seg_usuarios RENAME TO usuarios;

ALTER TABLE public.seg_rol_permiso SET SCHEMA seg;
ALTER TABLE seg.seg_rol_permiso RENAME TO rol_permiso;

ALTER TABLE public.seg_usuario_rol SET SCHEMA seg;
ALTER TABLE seg.seg_usuario_rol RENAME TO usuario_rol;

ALTER TABLE public.seg_publicaciones SET SCHEMA seg;
ALTER TABLE seg.seg_publicaciones RENAME TO publicaciones;

-- Actualizar la función get_current_user_empresa_id para usar el nuevo schema
CREATE OR REPLACE FUNCTION public.get_current_user_empresa_id()
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_email TEXT;
  user_empresa_id UUID;
BEGIN
  user_email := auth.jwt() ->> 'email';
  
  IF user_email IS NULL THEN
    RETURN NULL;
  END IF;
  
  SELECT empresa_id INTO user_empresa_id
  FROM seg.usuarios
  WHERE email = user_email AND activo = true;
  
  RETURN user_empresa_id;
END;
$function$;

-- Otorgar permisos al schema seg
GRANT USAGE ON SCHEMA seg TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA seg TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA seg TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA seg GRANT ALL ON TABLES TO anon, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA seg GRANT ALL ON SEQUENCES TO anon, authenticated;
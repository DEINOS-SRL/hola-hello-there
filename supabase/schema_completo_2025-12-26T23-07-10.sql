-- Esquema completo de la base de datos
-- Exportado: 2025-12-26T23:07:10.969Z
-- Base de datos: postgres
-- Proyecto: ezchqajzxaeepwqqzmyr


-- =============================================
-- TABLAS
-- =============================================


-- =============================================
-- CONSTRAINTS
-- =============================================


-- =============================================
-- FUNCIONES
-- =============================================

CREATE OR REPLACE FUNCTION public.get_current_user_empresa_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
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
$function$
;

CREATE OR REPLACE FUNCTION public.get_current_usuario_id()
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  user_email TEXT;
  usuario_uuid UUID;
BEGIN
  user_email := auth.jwt() ->> 'email';

  IF user_email IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT u.id INTO usuario_uuid
  FROM seg.usuarios u
  WHERE u.email = user_email AND u.activo = true
  LIMIT 1;

  RETURN usuario_uuid;
END;
$function$
;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
 RETURNS trigger
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$
;


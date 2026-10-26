-- ———————————————————————————————————————————————
--  FUNCIÓN HELPER PARA VERIFICAR QUE EL USUARIO
--       REALMENTE TENGA PERMISOS DE ADMIN
-- ———————————————————————————————————————————————

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM public.profiles p
     WHERE p.id = auth.uid()
       AND p.role in ('admin', 'superadmin')
  );
$$;

REVOKE EXECUTE ON FUNCTION public.is_admin() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.is_admin() TO authenticated;

-- ———————————————————————————————————————————————
--  FUNCIÓN HELPER PARA SABER SI UN CORREO TIENE
--         CUENTA ANTES DE ENVIAR UN CORREO
-- ———————————————————————————————————————————————

-- auth.users no está expuesta por la API, así que la Edge Function
-- request-password-reset la consulta a través de esta función.
-- Solo service_role puede ejecutarla: si anon o authenticated pudieran
-- llamarla, cualquiera podría averiguar qué correos tienen cuenta.

CREATE OR REPLACE FUNCTION public.email_has_account(p_email text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT EXISTS (
    SELECT 1
      FROM auth.users u
     WHERE lower(u.email) = lower(p_email)
  );
$$;

REVOKE EXECUTE ON FUNCTION public.email_has_account(text) FROM PUBLIC, anon, authenticated;
GRANT  EXECUTE ON FUNCTION public.email_has_account(text) TO service_role;

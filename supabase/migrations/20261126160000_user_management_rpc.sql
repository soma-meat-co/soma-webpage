-- ———————————————————————————————————————————————
-- INDEX: RPCs PARA LA GESTIÓN DE USUARIOS
--      Listar, editar y eliminar usuarios desde
--      /DMS/admin/user-management. Solo admin: las tres
--      validan `is_admin()` antes de hacer cualquier cosa.
--
--      SECURITY DEFINER: corren con los permisos del dueño
--      de la función, no con los de quien llama. Hace
--      falta porque:
--        - "profiles: leer propio" solo deja leer el propio
--          perfil, y el correo vive en `auth.users`, que no
--          está expuesta por la API.
--        - `authenticated` solo tiene UPDATE sobre las
--          columnas de nombre, y solo en su propio perfil.
--        - borrar la cuenta es borrar de `auth.users`.
--      Por eso el chequeo de `is_admin()` es lo único que
--      protege estas funciones: va primero y falla cerrado.
--
--      Errores:
--        42501 -> quien llama no es admin
--        P0002 -> el usuario no existe
--        22023 -> un admin intenta eliminarse a sí mismo
--        23503 -> el área no existe (editar), o el usuario
--                 tiene documentos, carpetas o áreas a su
--                 nombre (eliminar)
-- ———————————————————————————————————————————————

-- INDEX: RPC -> get_all_users
-- Devuelve todos los usuarios con su correo y el nombre de su área (o null si
-- todavía no tiene una asignada).
CREATE OR REPLACE FUNCTION public.get_all_users()
RETURNS TABLE (
    id               uuid,
    email            text,
    nombre           text,
    apellido_paterno text,
    apellido_materno text,
    role             public.app_role,
    area_id          uuid,
    area_name        text,
    activated_at     timestamptz,
    created_at       timestamptz
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Solo admin puede listar usuarios'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- TODO: paginación. Por ahora regresa todos los usuarios; cuando sean
    -- muchos, recibir p_limit / p_offset (o un cursor) y devolver el total.
    RETURN QUERY
    SELECT p.id,
           u.email::text,
           p.nombre,
           p.apellido_paterno,
           p.apellido_materno,
           p.role,
           p.area_id,
           a.name,
           p.activated_at,
           p.created_at
    FROM public.profiles p
    JOIN auth.users u ON u.id = p.id
    LEFT JOIN public.areas a ON a.id = p.area_id
    ORDER BY p.nombre, p.apellido_paterno, u.email;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_all_users() FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.get_all_users() TO authenticated;


-- INDEX: RPC -> edit_user_data
-- Cambia el nombre y el área de un usuario. A los usuarios invitados se les
-- asigna el área aquí, después de crearlos. p_area_id = null lo deja sin área.
-- El rol no se edita aquí.
CREATE OR REPLACE FUNCTION public.edit_user_data(
    p_user_id          uuid,
    p_nombre           text,
    p_apellido_paterno text,
    p_apellido_materno text,
    p_area_id          uuid
)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Solo admin puede editar usuarios'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- La FK profiles_area_id_fkey rechaza un área que no existe (23503).
    UPDATE public.profiles
    SET nombre           = p_nombre,
        apellido_paterno = p_apellido_paterno,
        apellido_materno = p_apellido_materno,
        area_id          = p_area_id,
        updated_at       = now()
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe el usuario %', p_user_id
            USING ERRCODE = 'no_data_found';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.edit_user_data(uuid, text, text, text, uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.edit_user_data(uuid, text, text, text, uuid) TO authenticated;


-- INDEX: RPC -> remove_user
-- Borra la cuenta de `auth.users`; su perfil se borra en cascada. Si el usuario
-- subió documentos o creó carpetas o áreas, las FK (sin ON DELETE) lo impiden
-- con 23503 y no se borra nada.
CREATE OR REPLACE FUNCTION public.remove_user(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
VOLATILE
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Solo admin puede eliminar usuarios'
            USING ERRCODE = 'insufficient_privilege';
    END IF;

    -- Sin esto, un admin podría borrar su propia cuenta a media sesión.
    IF p_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Un admin no puede eliminarse a sí mismo'
            USING ERRCODE = 'invalid_parameter_value';
    END IF;

    DELETE FROM auth.users
    WHERE id = p_user_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'No existe el usuario %', p_user_id
            USING ERRCODE = 'no_data_found';
    END IF;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.remove_user(uuid) FROM PUBLIC, anon;
GRANT  EXECUTE ON FUNCTION public.remove_user(uuid) TO authenticated;

-- ——————————————————————————————————————————————————————————————
-- Creación del usuario admin en una base nueva (local)
-- ——————————————————————————————————————————————————————————————
--
-- bootstrap_admin (20261023010900) exige que lucaso.javier@gmail.com ya exista
-- en auth.users. En producción se creó desde el Dashboard, pero en local
-- `supabase db reset` parte de una base vacía y bootstrap_admin fallaría.
-- Esta migración crea el usuario justo antes, solo si no existe.
--
-- En producción no hace nada: el usuario ya existe y la migración termina sin
-- cambios. Aun así, para que `supabase db push` no la ejecute ni se queje de que
-- es más vieja que las migraciones remotas, márcala como aplicada en remoto una
-- sola vez:
--   npx supabase migration repair --status applied 20261023010850
--
-- Contraseña local: 12345678 (solo para desarrollo; en producción el usuario
-- conserva la contraseña que ya tiene).

do $$
declare
    v_user_id uuid := gen_random_uuid();
begin
    if exists (select 1 from auth.users where email = 'lucaso.javier@gmail.com') then
        return;
    end if;

    -- Las columnas de tokens van como '' y no NULL: Supabase Auth falla al
    -- iniciar sesión si las encuentra en NULL.
    insert into auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        recovery_token,
        email_change_token_new,
        email_change
    ) values (
        '00000000-0000-0000-0000-000000000000',
        v_user_id,
        'authenticated',
        'authenticated',
        'lucaso.javier@gmail.com',
        extensions.crypt('12345678',extensions.gen_salt('bf')),
        now(),
        '{"provider": "email", "providers": ["email"]}',
        '{}',
        now(),
        now(),
        '',
        '',
        '',
        ''
    );

    -- Sin la identidad de tipo email, el usuario existe pero no puede iniciar sesión.
    insert into auth.identities (
        id,
        user_id,
        provider_id,
        identity_data,
        provider,
        last_sign_in_at,
        created_at,
        updated_at
    ) values (
        gen_random_uuid(),
        v_user_id,
        v_user_id::text,
        jsonb_build_object(
            'sub', v_user_id::text,
            'email', 'lucaso.javier@gmail.com',
            'email_verified', true
        ),
        'email',
        now(),
        now(),
        now()
    );
end;
$$;

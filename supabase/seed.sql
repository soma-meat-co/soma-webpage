-- ———————————————————————————————————————————————
--        TITLE: SEED LOCAL
--  Solo corre en local, después de cada `npx supabase db reset`.
--  Nunca se aplica a producción. No poner valores de producción aquí.
-- ———————————————————————————————————————————————

-- INDEX: Vault secrets para el cron `hard-delete-documents`
-- `secret_key`: reemplaza <LOCAL_SECRET_KEY> por la "Secret key" que muestra
-- `npx supabase status`. No se commitea el valor real (GitHub push protection).
--
-- Si el cron no llega a la función: el cron corre dentro del contenedor de
-- Postgres, donde 127.0.0.1 es el propio contenedor. Revisa la respuesta con
--   SELECT * FROM net._http_response ORDER BY created DESC LIMIT 1;
-- y si `error_msg` dice "connection refused", cambia la URL por:
--   SELECT vault.create_secret('http://host.docker.internal:54321', 'project_url');
SELECT vault.create_secret('http://127.0.0.1:54321', 'project_url');
SELECT vault.create_secret('<LOCAL_SECRET_KEY>', 'secret_key');

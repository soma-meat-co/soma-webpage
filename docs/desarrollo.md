## Manejo de Sesión
La sesión se maneja desde `auth.provider` y todos los datos de sesión los maneja supabase directamente desde `src\lib\core\auth\client.ts`. 
Ya creamos el userContext que será utilizado en todo el DMS el cual maneja simplemetne un `CurrentUser`.


### After Login() to...
Después del login creamos la ruta `DMS/page.tsx` que es la landing page despues de iniciar sesión. Ahí dependiendo el rol son los permisos que el usuario tendrá. La landing page tendrá unicamente un Header con el numbre y el logo de SOMA.

## Clientes de Supabase

| Cliente | Archivo | Dónde se usa | Sesión |
|---|---|---|---|
| Navegador | `src/lib/core/auth/client.ts` | Componentes `"use client"` | Del usuario, desde cookies del navegador. Instancia única. |
| Servidor | `src/lib/core/auth/serverClient.ts` | Server Actions, Route Handlers, Server Components | Del usuario de la request, vía `cookies()`. Se crea uno por request con `createSupabaseServerClient()`. |
| Proxy | `src/lib/core/auth/proxySession.ts` | Solo `src/proxy.ts` | Del usuario, desde `request.cookies`. |

Ninguno usa la secret key. Las operaciones que la necesitan viven en Edge Functions (ver [ADR-007](./decisions/ADR-007-privileged-operations-edge-functions.md)).

## Operaciones de administración

Las funciones que solo un admin puede ejecutar viven en `src/lib/core/admin/`:

- `provider/admin.provider.ts` — contrato (`AdminProvider`) y tipos.
- `service/admin.service.ts` — implementación con Supabase. Invoca la Edge Function con el cliente de servidor y traduce sus errores a `AppError`.

### Invitar usuario

```
/DMS/admin/invite-user/page.tsx   → formulario
        ↓
invite-user/actions.ts            → inviteUserAction(): devuelve { ok, email } o { ok: false, code, message }
        ↓
adminProvider.inviteNewUser()     → functions.invoke('invite-user-as-admin')
        ↓
supabase/functions/invite-user-as-admin  → valida JWT + is_admin(), invita con service role, registra created_by
        ↓
Correo de invitación → /DMS/set-password
```

Requiere el secreto `INVITE_REDIRECT_URL` (apuntando a `/DMS/set-password`) en `supabase/functions/.env` para local y en los secretos del proyecto en producción.

## Ingreso de documentos

Tablas base (ver [ADR-008](./decisions/ADR-008-phased-document-access.md)):

| Tabla | Migración | Contenido |
|---|---|---|
| `areas` | `20261111224232_area_table_creation.sql` | Catálogo de áreas (`name` único) |
| `documents` | `20261111225408_create_documents_table.sql` | Metadatos y `file_path` en R2. Soft delete con `deleted_at` / `deleted_by` |
| `document_areas` | `20261111230117_create_document_area_table.sql` | Relación N:N documento ↔ área. Se borra en cascada con el documento o el área |

### Acceso — fase 1 (producción)

- `SELECT`: cualquier usuario `authenticated` ve todos los documentos, áreas y relaciones.
- `INSERT` / `UPDATE` / `DELETE`: solo `public.is_admin()`.

Mientras esta fase esté activa, no subir documentos que solo deban ver algunas áreas.

### Hard delete

Borrar un documento desde la app es un soft delete: se marcan `deleted_at` y `deleted_by`. Next nunca borra archivos de R2.

El borrado definitivo lo hace la Edge Function `hard-delete-documents`, que dispara un job de `pg_cron` (diario a las 2:00 UTC) con `pg_net`:

```
pg_cron → net.http_post (apikey = secret key desde Vault)
        ↓
hard-delete-documents  → busca documentos con deleted_at de más de 30 días
                       → borra el archivo en R2
                       → borra la fila (solo si el archivo se borró)
```

Configuración necesaria:

- Vault: `project_url` y `secret_key` (`select vault.create_secret('<valor>', '<nombre>');`).
- Secretos de la función: `R2_ACCOUNT_ID`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_BUCKET`. En local van en `supabase/functions/.env`.

### Pendientes

La lista completa vive en ADR-008: lectura restringida por tags o áreas, admin por área, ocultar documentos borrados, hard delete en R2, FK de `profiles.area_id` y presigned URLs.

## Errores

Todas las capas lanzan subclases de `AppError` (`src/lib/errors/base.ts`):

| Clase | Archivo | Para qué |
|---|---|---|
| `AuthError` | `errors/auth.ts` | Autenticación: no hay sesión, credenciales, links de correo, contraseñas |
| `AccessError` | `errors/access.ts` | Autorización: hay sesión pero no hay permiso, o no se pudo verificar el rol |
| `AdminError` | `errors/admin.ts` | Operaciones de administración: datos inválidos, correo duplicado o no institucional |
| `UserError` | `errors/user.ts` | Datos del perfil del usuario |

Cada `AppError` tiene `code` (estable, para la UI), `detail` (técnico, solo para logs), `genericMessage` (para mostrar al usuario) y `statusCode`.

Las clases de error no sobreviven el paso del servidor al cliente. Las Server Actions atrapan los `AppError` y devuelven `{ ok: false, code, message }` con el `genericMessage`.


# ADR-007: Operaciones con service role en Edge Functions

- **Estado:** Aceptado
- **Fecha:** 2026-11-10
- **Autor:** Javier
- **Relacionado con:** [ADR-003](./ADR-003-supabase-baas.md), [ADR-005](./ADR-005-abstraction-layer.md), [ADR-006](./ADR-006-simplified-roles-in-profiles.md)

---

## Contexto

Algunas operaciones de administración no se pueden hacer con la sesión del usuario y requieren la secret key (service role) de Supabase. El primer caso es invitar usuarios (`auth.admin.inviteUserByEmail`).

La service role se salta RLS por completo: quien la tenga controla toda la base de datos y `auth`. Por eso la decisión importante es **dónde vive la key**, no solo cómo se protege su uso.

Se evaluaron dos opciones:

1. **Next.js (Server Action + servicio `server-only`).** La key vive en el entorno del host de Next. Un guard (`requireAdmin()`) valida sesión y rol antes de usar el cliente admin.
2. **Edge Function de Supabase.** La key vive solo en Supabase. Next invoca la función con el JWT del usuario y la función valida el rol.

## Decisión

Toda operación que requiere la service role vive en una **Edge Function de Supabase**. Next.js nunca tiene la secret key.

### Flujo

```
page.tsx ("use client")
      ↓  llama
Server Action (app/.../actions.ts)        → nunca lanza; devuelve { ok, code, message }
      ↓
adminProvider (lib/core/admin/service)    → cliente de sesión + functions.invoke
      ↓  JWT del usuario
Edge Function (supabase/functions/...)    → valida JWT, is_admin(), usa service role
      ↓
Supabase Auth / Postgres
```

### Reglas

- La Edge Function es la única responsable de validar el rol (`public.is_admin()` con el cliente del usuario) antes de usar el cliente admin. Falla cerrado: si el RPC da error o el resultado no es `true`, rechaza.
- Next invoca la función con el cliente de servidor de sesión (`createSupabaseServerClient`), que manda el JWT del usuario. No repite la validación de rol.
- El rol del usuario creado nunca se recibe del body.
- Las respuestas de error de las Edge Functions usan el formato `{ code, message }`. El servicio en `/lib/core/admin/` traduce cada `code` a un `AppError` (`AuthError`, `AccessError` o `AdminError`).
- Las Server Actions atrapan los `AppError` y devuelven objetos planos `{ ok: false, code, message }`, donde `message` es el `genericMessage` del error. El detalle técnico solo va a los logs del servidor.
- Las operaciones de administración que **no** requieren la service role se resuelven con el cliente de sesión y RLS, sin Edge Function.

## Razón

- **La key no está donde no se necesita.** Si se compromete el host de Next (variables de entorno filtradas, un bug en una Server Action), la service role no está ahí. Ningún guard en código ofrece esa garantía.
- **Un solo lugar valida.** La función recibe el JWT y verifica el rol del lado de Supabase; no hay que mantener la misma regla en dos runtimes.
- **Mejor registro.** La función puede registrar `created_by` con el id de quien llama, útil para el Audit Log.
- **Independiente del hosting de Next.** La operación funciona igual sin importar dónde se despliegue el frontend.

## Consecuencias

- `SUPABASE_SECRET_KEY` no debe existir en el entorno de Next ni en `privateEnv.ts`. Si una operación nueva la necesita, se crea una Edge Function.
- La lógica de una operación privilegiada queda en dos lugares: la Edge Function (Deno) y el servicio que la invoca y traduce errores (Next). Hay dos deploys y dos lugares de logs.
- Probar en local requiere `npx supabase start` y `npx supabase functions serve <función>`, además de `next dev`.
- Cada Edge Function que redirige al usuario usa un secreto propio para la URL (por ejemplo `INVITE_REDIRECT_URL`). Debe configurarse en `supabase/functions/.env` para local y como secreto del proyecto en producción, y la URL debe estar permitida en *Authentication → URL Configuration → Redirect URLs*.
- `is_admin()` devuelve un booleano. Cuando se implementen roles por área (ver ADR-006), las funciones necesitarán una validación con alcance por área, que se definirá en un nuevo ADR.

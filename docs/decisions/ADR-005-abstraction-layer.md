# ADR-005: Capa de abstracción para BaaS y storage

- **Estado:** Aceptado
- **Fecha:** 2026-08-06
- **Autor:** Javier

---

## Contexto

El proyecto depende de dos servicios externos — Supabase y Cloudflare R2 — cuyos SDKs podrían cambiar, o que en el futuro podrían reemplazarse por alternativas (Better Auth + Neon, AWS S3, etc.). Sin una capa de abstracción, cada cambio de proveedor implicaría buscar y reemplazar llamadas al SDK en toda la codebase.

## Decisión

Ningún componente, page, o server action importa los SDKs de Supabase o R2 directamente. Toda interacción pasa por dos módulos de abstracción:

```
/lib/auth.ts     — toda operación relacionada con autenticación y usuarios
/lib/storage.ts  — toda operación relacionada con archivos y presigned URLs
```

### Estructura de flujo

```
Componentes / Pages / Server Actions
              ↓
    /lib/auth.ts  |  /lib/storage.ts
              ↓
    Supabase SDK  |  AWS SDK v3 (R2)
```

## Razón

- **Migración localizada** — cambiar de Supabase a otro proveedor implica reescribir `/lib/auth.ts`, no buscar llamadas al SDK en 30 archivos.
- **Surface de acoplamiento controlada** — el resto del sistema desconoce qué BaaS o storage se usa. Solo conoce las funciones exportadas por `/lib/`.
- **Testabilidad** — los módulos `/lib/` pueden mockearse en tests sin tocar los componentes.
- **Documentación natural** — al concentrar toda la lógica de integración en dos archivos, el TSDoc en esas funciones documenta el contrato completo del sistema con sus servicios externos.

## Consecuencias

- **`/lib/auth.ts`** exporta funciones como `getSession()`, `createUser()`, `getUserRole()`, `assignTag()`. Nada más importa `@supabase/supabase-js` fuera de este archivo y del cliente de Supabase.
- **`/lib/storage.ts`** exporta funciones como `getSignedUrl()`, `uploadDocument()`, `deleteDocument()`. Nada más importa `@aws-sdk/client-s3` fuera de este archivo.
- Las funciones en `/lib/` son las únicas que requieren TSDoc completo obligatorio (ver estrategia de documentación del proyecto).
- Cualquier tarea en ClickUp que involucre auth o storage se implementa añadiendo una función a `/lib/`, no llamando al SDK desde el componente.

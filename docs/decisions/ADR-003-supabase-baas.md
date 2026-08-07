# ADR-003: Supabase como BaaS para autenticación y base de datos

- **Estado:** Aceptado
- **Fecha:** 2026-08-06
- **Autor:** Javier

---

## Contexto

El sistema requiere autenticación con email/password y una base de datos para almacenar metadata de documentos, usuarios y permisos. Se evaluaron las siguientes alternativas:

- **Supabase** — BaaS open-source sobre PostgreSQL con Row Level Security nativo.
- **Firebase** — BaaS de Google sobre Firestore (NoSQL), con PostgreSQL disponible vía Data Connect desde 2024.
- **Better Auth** — librería de auth TypeScript-nativa, sin base de datos propia.

## Decisión

Se adopta **Supabase** como BaaS para autenticación y base de datos.

## Razón

El sistema de control de acceso basado en tags requiere que los permisos sean verificables en toda la cadena de acceso a datos. Supabase es la única opción evaluada donde esto ocurre de forma nativa:

**Row Level Security (RLS)** — las políticas de acceso se aplican a nivel de base de datos PostgreSQL. Toda query — desde la app, un script, una función serverless o una conexión directa — pasa por el mismo check de seguridad. Con Firebase, las Security Rules solo protegen el acceso vía SDK; el Admin SDK las bypasea completamente.

**Integración auth ↔ RLS** — `auth.uid()` funciona directamente dentro de las políticas RLS, permitiendo definir "este usuario solo lee documentos cuyos tags intersectan con sus propios tags" directamente en la base de datos.

**Sin vendor lock-in severo** — Supabase es PostgreSQL estándar. Migrar la base de datos es un `pg_dump`. Firebase requeriría reescribir toda la capa de datos.

**Experiencia previa** — el equipo conoce Supabase, reduciendo tiempo de setup y riesgo de implementación.

### Comparativa de decisión

| Criterio | Firebase | Supabase | Better Auth |
|---|---|---|---|
| Base de datos relacional nativa | Parcial (Data Connect) | ✓ PostgreSQL | Trae el tuyo |
| RLS a nivel de DB | ✗ | ✓ | ✗ |
| Auth integrado con permisos DB | ✗ | ✓ | ✗ |
| Open source / portable | ✗ | ✓ | ✓ |
| Curva de aprendizaje | Baja | Baja (conocido) | Media |

### Por qué no Better Auth

Better Auth sería preferible si el proyecto tuviera multi-tenancy desde el inicio o si la base de datos fuera externa a Supabase. Para este caso — un solo tenant, con RLS como mecanismo central de control de acceso — romper el acoplamiento auth ↔ RLS añade complejidad sin beneficio.

## Consecuencias

- Toda interacción con Supabase vive en `/lib/auth.ts` — los componentes nunca importan el SDK directamente.
- Las políticas RLS son la fuente de verdad para permisos — no se duplica lógica de acceso en el frontend.
- El proyecto puede migrar a otro Postgres con `pg_dump` + reconfiguración de `/lib/auth.ts`.
- Los proyectos inactivos en el free tier de Supabase se pausan después de 1 semana — considerar plan Pro si el proyecto entra en producción activa.

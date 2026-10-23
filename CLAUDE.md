# CLAUDE.md — SOMA DMS

Instrucciones para Claude CLI en este repositorio.

---

## Rol en este proyecto

Eres un acompañante técnico, no un desarrollador adicional. Tu función es orientar decisiones, explicar conceptos, revisar código y señalar problemas — no escribir ni modificar código de forma autónoma.

**Regla principal: no hagas cambios al código a menos que Javier lo indique explícitamente.**

Esto incluye:
- No modificar archivos existentes sin instrucción directa.
- No crear archivos nuevos sin instrucción directa.
- No refactorizar "de paso" mientras revisas algo.
- No corregir errores menores sin preguntar primero.

Cuando detectes un problema, descríbelo y explica el impacto. Espera instrucción antes de actuar.

---

## El proyecto

**SOMA DMS** — biblioteca interna de documentos para SOMA MEAT CO.

Sistema web para gestionar y servir documentos internos con control de acceso por roles y tags. Solo accesible para usuarios autenticados con permisos asignados.

### Stack

| Capa | Tecnología |
|---|---|
| Frontend | React + Next.js (App Router) |
| Auth + DB | Supabase (PostgreSQL + RLS) |
| File storage | Cloudflare R2 (S3-compatible, zero egress) |
| Acceso a archivos | Presigned URLs generadas server-side |
| Componentes UI | shadcn/ui — Base UI, Nova preset |

### Decisiones de arquitectura

Todas las decisiones están documentadas en `/docs/decisions/`. Antes de proponer cambios de arquitectura, revisa los ADRs existentes.

Decisiones clave ya tomadas y cerradas:
- Object storage sobre block/file storage → ADR-001
- Cloudflare R2 como proveedor → ADR-002
- Supabase como BaaS → ADR-003
- Modelo de roles y tag-matching → ADR-004
- Capa de abstracción `/lib/` → ADR-005

---

## Principios de desarrollo

### Limpieza

- Código explícito sobre código inteligente. Si hay que pensar dos veces para entender una línea, se reescribe.
- Sin abstracciones prematuras. Abstraer solo cuando hay repetición real, no anticipada.
- Sin dependencias innecesarias. Antes de agregar un paquete, preguntar si se puede resolver con lo que ya existe.
- Nombrar con intención. Variables, funciones y archivos deben describir qué hacen, no cómo lo hacen.

### Escalabilidad

- Toda interacción con Supabase vive en `/lib/auth.ts`. Ningún componente importa el SDK directamente.
- Toda interacción con R2 vive en `/lib/storage.ts`. Ningún componente importa el SDK directamente.
- Los permisos se validan en el servidor — nunca en el cliente.
- RLS es la fuente de verdad para acceso a datos. No duplicar lógica de permisos en el frontend.

### Seguridad

- Ningún archivo en R2 tiene URL pública permanente.
- Las presigned URLs se generan server-side, después de validar permisos vía RLS.
- Las credenciales de R2 y Supabase nunca llegan al cliente.
- Las rutas se protegen en `middleware.ts` — validación de sesión y rol en cada request.

---

## Modelo de roles

```
superadmin     → scope sistema, crea global_admin
global_admin   → scope sistema, crea area_admin y users
area_admin     → scope área asignada, crea users en su área
user           → acceso por tag-matching con documentos
```

**Regla de privilegios:** ningún actor puede asignar roles con más permisos que los propios. Validado en RLS al insertar en `user_roles`.

**Tag-matching:** un usuario accede a un documento si al menos uno de sus tags coincide con los tags del documento. Los tags son asignados por administración.

---

## Estructura de Funciones

Toda función requiere TSDoc completo antes de considerarse terminada:

```typescript
/**
 * Descripción de qué hace la función.
 *
 * @param nombre - descripción
 * @returns descripción del valor de retorno
 * @throws {NombreDeError} cuándo y por qué
 * @example
 * const resultado = await miFuncion(param)
 */
```

---

## Documentación

### ADRs

Las decisiones de arquitectura viven en `/docs/decisions/`. Formato: `ADR-NNN-nombre-descriptivo.md`.

Un ADR no se modifica — si una decisión cambia, se crea uno nuevo que referencia al anterior. El índice vive en `/docs/decisions/README.md`.

### TSDoc

Obligatorio en todas las funciones. Opcional en componentes simples. El objetivo es responder cinco preguntas: qué hace, qué necesita, qué devuelve, qué puede fallar, cómo se usa.

---

## Cómo trabajar en este repo

### Lo que se espera de Claude

- **Revisar** código cuando se pida, señalando problemas con explicación de impacto.
- **Orientar** decisiones presentando opciones con pros y contras, sin imponer una.
- **Explicar** conceptos cuando algo no quede claro.
- **Escribir código** solo cuando Javier lo pida explícitamente.
- **Crear archivos** solo cuando Javier lo pida explícitamente.
- **Sugerir** mejoras como recomendaciones, nunca como cambios directos.

### Lo que Claude no hace sin instrucción explícita

- Modificar archivos existentes.
- Crear archivos nuevos.
- Refactorizar código "de paso".
- Instalar dependencias.
- Corregir errores sin preguntar si se quiere la corrección.

### Cuando Claude detecta un problema

1. Describir el problema con precisión.
2. Explicar el impacto concreto (seguridad, performance, mantenibilidad).
3. Proponer una solución.
4. Esperar instrucción antes de aplicarla.

---

## Tareas en ClickUp

El plan de trabajo vive en ClickUp, carpeta **Soma DMS** dentro de **Personal**. Las listas son:

- `0. Setup Inicial`
- `1. Auth y User Access`
- `2. R2 File Storage`
- `3. Manejo de Archivos`
- `4. Control de Acceso`
- `5. Audit Log`

Una tarea en `/lib/` no se marca done hasta que sus funciones tengan TSDoc completo.

---

## Contexto de negocio

SOMA MEAT CO es una marca mexicana de cárnicos premium (certificación TIF, HACCP) con dos líneas de producto: estándar y RESERVA. El DMS sirve documentos internos al equipo de la empresa — no es un producto público. Los documentos incluyen materiales como el Brand Book v3.0 y documentación operativa interna.
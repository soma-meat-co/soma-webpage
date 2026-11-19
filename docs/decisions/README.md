# Architecture Decision Records

Registro de decisiones arquitectónicas del proyecto. Cada ADR documenta una decisión importante: su contexto, la decisión tomada, la razón y las consecuencias.

## Índice

| ADR | Título | Estado |
|---|---|---|
| [ADR-001](./ADR-001-object-storage-paradigm.md) | Object Storage como paradigma de almacenamiento | Aceptado |
| [ADR-002](./ADR-002-cloudflare-r2.md) | Cloudflare R2 como proveedor de object storage | Aceptado |
| [ADR-003](./ADR-003-supabase-baas.md) | Supabase como BaaS para autenticación y base de datos | Aceptado |
| [ADR-004](./ADR-004-roles-and-access-control.md) | Modelo de roles y control de acceso por tags | Parcialmente reemplazado por ADR-006 |
| [ADR-005](./ADR-005-abstraction-layer.md) | Capa de abstracción para BaaS y storage | Aceptado |
| [ADR-006](./ADR-006-simplified-roles-in-profiles.md) | Modelo de roles simplificado en `profiles` | Aceptado |
| [ADR-007](./ADR-007-privileged-operations-edge-functions.md) | Operaciones con service role en Edge Functions | Aceptado |
| [ADR-008](./ADR-008-phased-document-access.md) | Acceso a documentos por fases | Aceptado (fase 1) |
| [ADR-009](./ADR-009-view-only-documents-and-access-log.md) | Documentos de solo lectura y registro de accesos | Aceptado |
| [ADR-010](./ADR-010-direct-upload-with-pending-row.md) | Subida directa a R2 con fila previa | Aceptado |

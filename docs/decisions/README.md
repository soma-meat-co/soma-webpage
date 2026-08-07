# Architecture Decision Records

Registro de decisiones arquitectónicas del proyecto. Cada ADR documenta una decisión importante: su contexto, la decisión tomada, la razón y las consecuencias.

## Reglas

- Los ADRs **no se modifican** — son un registro histórico.
- Si una decisión cambia, se crea un **nuevo ADR** que referencia al anterior.
- El estado puede ser: `Propuesto` · `Aceptado` · `Deprecado` · `Reemplazado por ADR-XXX`.

## Índice

| ADR | Título | Estado |
|---|---|---|
| [ADR-001](./ADR-001-object-storage-paradigm.md) | Object Storage como paradigma de almacenamiento | Aceptado |
| [ADR-002](./ADR-002-cloudflare-r2.md) | Cloudflare R2 como proveedor de object storage | Aceptado |
| [ADR-003](./ADR-003-supabase-baas.md) | Supabase como BaaS para autenticación y base de datos | Aceptado |
| [ADR-004](./ADR-004-roles-and-access-control.md) | Modelo de roles y control de acceso por tags | Aceptado |
| [ADR-005](./ADR-005-abstraction-layer.md) | Capa de abstracción para BaaS y storage | Aceptado |

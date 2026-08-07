# ADR-004: Modelo de roles y control de acceso por tags

- **Estado:** Aceptado
- **Fecha:** 2026-08-06
- **Autor:** Javier

---

## Contexto

El sistema necesita controlar quién puede acceder a qué documentos. Los documentos pertenecen a áreas y tienen permisos diferenciados. Se requiere además un sistema de administración donde los administradores puedan gestionar usuarios sin poder exceder sus propios permisos.

Se evaluó implementar el modelo de herencia dinámica de privilegios de Snowflake (donde un admin puede crear "usuarios hijos" con un subconjunto de sus propios permisos de forma completamente dinámica) versus un modelo de roles fijos con scope de área.

## Decisión

Se adopta un **modelo de 4 roles fijos con scope de área** y **control de acceso por tag-matching**.

### Jerarquía de roles

```
Superadmin
├── Scope: sistema completo
├── Puede crear: global_admin, area_admin, user
├── Puede asignar: cualquier tag
└── Acceso: todos los documentos + panel de sistema

Global Admin
├── Scope: sistema completo
├── Puede crear: area_admin, user
├── Puede asignar: cualquier tag
└── Acceso: todos los documentos (no puede crear superadmin)

Area Admin
├── Scope: su área asignada únicamente
├── Puede crear: user (solo en su área)
├── Puede asignar: solo tags de su área
└── Acceso: documentos de su área

User
├── Scope: sus tags asignados
└── Acceso: documentos cuyos tags intersectan con los propios
```

### Mecanismo de acceso — tag-matching

```
Documento [tags: legal, confidencial]
Usuario   [tags: legal]
                ↓
    ¿Intersección no vacía? → Acceso granted
```

Un usuario accede a un documento si al menos uno de sus tags coincide con los del documento. Un documento puede tener múltiples tags. Los tags son creados y asignados por administración.

## Razón

**Por qué no el modelo dinámico de Snowflake completo:**

El modelo dinámico requiere políticas RLS recursivas para recorrer el árbol de roles en cada query — costoso en performance y difícil de debuggear. Para el tamaño actual del proyecto, la complejidad no justifica el beneficio.

El modelo de roles fijos con scope de área captura el 90% del valor de Snowflake:

- Ningún admin puede crear roles con más permisos que el propio.
- El scope de área limita el radio de acción de cada admin.
- Las políticas RLS son estáticas y predecibles.

El modelo dinámico completo puede incorporarse en una iteración futura si el negocio escala a múltiples organizaciones independientes.

**Por qué tag-matching sobre permisos por documento:**

- Flexible: un admin asigna tags al usuario una vez; el acceso a nuevos documentos con ese tag es automático.
- Escalable: agregar nuevas áreas o categorías no requiere reasignar permisos individualmente.
- Implementable directamente en RLS con una comparación de arrays en PostgreSQL.

## Consecuencias

- Tabla `roles` con los 4 roles definidos como enum — no dinámica.
- Tabla `areas` para las áreas de la organización.
- Tabla `user_roles` que conecta usuario ↔ rol ↔ área (área null para roles globales).
- Tabla `tags` gestionada por administración.
- Tabla `user_tags` y `document_tags` para el tag-matching.
- RLS policy en `documents`: `EXISTS (SELECT 1 FROM user_tags ut JOIN document_tags dt ON ut.tag_id = dt.tag_id WHERE ut.user_id = auth.uid() AND dt.document_id = documents.id)`.
- Server action valida permisos vía RLS antes de generar presigned URL — doble validación.
- Si en el futuro se requiere modelo dinámico, se agrega `parent_role_id` a la tabla de roles y se migran las políticas RLS.

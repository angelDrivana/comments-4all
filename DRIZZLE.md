# Integración con Drizzle ORM

Este proyecto ahora incluye configuración completa de Drizzle ORM como alternativa/complemento a Supabase.

## Archivos Creados

### Schema (`schema.ts`)
- Define las tablas `profiles` y `comments` con sus relaciones
- Usa tipos TypeScript inferidos automáticamente
- Incluye validación de esquema con jsonb para datos complejos

### Configuración (`drizzle.config.ts`)
- Configuración para PostgreSQL
- Apunta al schema principal y carpeta de migraciones

### Conexión a DB (`src/core/db.ts`)
- Cliente configurado con postgres-js
- Instancia de Drizzle con schema importado
- Exporta tipos inferidos para uso en la aplicación

### Servicios (`src/services/comments-drizzle.ts`)
- Implementaciones de ejemplo usando Drizzle
- Funciones CRUD completas
- Mapeo correcto entre tipos de Drizzle y tipos del proyecto

## Scripts Disponibles

```bash
# Generar migraciones basadas en cambios del schema
pnpm run db:generate

# Ejecutar migraciones pendientes
pnpm run db:migrate

# Push del schema directamente (desarrollo)
pnpm run db:push

# Abrir Drizzle Studio (GUI para la DB)
pnpm run db:studio

# Introspección de DB existente
pnpm run db:introspect
```

## Variables de Entorno

Asegúrate de tener configurada la variable de entorno:

```env
DATABASE_URL=postgresql://usuario:password@localhost:5432/comments
```

## Uso en el Código

### Importar la conexión
```typescript
import { db, schema } from '../core/db';
import { eq, desc } from 'drizzle-orm';
```

### Consultas básicas
```typescript
// Obtener todos los comentarios
const allComments = await db
  .select()
  .from(schema.comments)
  .orderBy(desc(schema.comments.created_at));

// Obtener comentarios con joins
const commentsWithUsers = await db
  .select({
    id: schema.comments.id,
    comment: schema.comments.comment,
    user: {
      username: schema.profiles.username
    }
  })
  .from(schema.comments)
  .leftJoin(schema.profiles, eq(schema.comments.userId, schema.profiles.id));
```

### Inserciones
```typescript
// Insertar comentario
const newComment = await db
  .insert(schema.comments)
  .values({
    userId: "uuid-del-usuario",
    comment: "Mi comentario",
    web_title: "Título de la página",
    current_location: "https://example.com",
    coordinates: [100, 200],
    boundElement: { /* objeto BoundElement */ }
  })
  .returning();
```

## Migración desde Supabase

Si quieres migrar completamente a Drizzle:

1. Genera el schema inicial: `pnpm run db:generate`
2. Ejecuta las migraciones: `pnpm run db:migrate`  
3. Reemplaza las llamadas en los servicios:
   ```typescript
   // Antes (Supabase)
   import { getComments } from '../services/comments';
   
   // Después (Drizzle)
   import { getCommentsWithDrizzle } from '../services/comments-drizzle';
   ```

## Ventajas de Drizzle

- **Type Safety**: Tipos TypeScript 100% seguros
- **Performance**: Consultas SQL optimizadas
- **Flexibilidad**: Control total sobre las consultas
- **Migrations**: Sistema robusto de migraciones
- **Studio**: GUI integrada para desarrollo
- **Zero Runtime**: Sin overhead en producción

## Integración Híbrida

También puedes usar Drizzle junto con Supabase:
- Drizzle para queries complejas y tipado
- Supabase para auth, realtime y storage
- Ambos pueden usar la misma base de datos PostgreSQL 
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '../../schema';

// Configuración de la conexión
const connectionString = process.env.PLASMO_PUBLIC_DATABASE_URL || "";

// Crear el cliente de PostgreSQL
const client = postgres(connectionString);

// Crear la instancia de Drizzle con el schema
export const db = drizzle(client, { schema });

// Exportar los tipos y tablas del schema para facilitar su uso
export { schema };
export type { Profile, NewProfile, Comment, NewComment } from '../../schema'; 
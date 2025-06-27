import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.PLASMO_PUBLIC_DATABASE_URL || ""
  },
  verbose: true,
  strict: true,
}); 
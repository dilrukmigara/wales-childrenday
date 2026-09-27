import { env } from 'cloudflare:workers';
export function database(): D1Database {
  const database = (env as unknown as { DB?: D1Database }).DB;
  if (!database) throw new Error('Database unavailable');
  return database;
}
export function adminPassword() {
  return (env as unknown as { ADMIN_PASSWORD?: string }).ADMIN_PASSWORD;
}

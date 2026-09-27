import { createDatabase } from './supabase';
export function database() {
  return createDatabase({ url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY });
}
export function adminPassword() { return process.env.ADMIN_PASSWORD; }

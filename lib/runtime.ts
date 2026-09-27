import { createDatabase } from './d1-http';

// Only server route handlers import this module; credentials never enter the client bundle.
export function database() {
  return createDatabase({
    CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_ACCOUNT_ID,
    CLOUDFLARE_D1_DATABASE_ID: process.env.CLOUDFLARE_D1_DATABASE_ID,
    CLOUDFLARE_API_TOKEN: process.env.CLOUDFLARE_API_TOKEN,
  });
}
export function adminPassword() {
  return process.env.ADMIN_PASSWORD;
}
